using Npgsql;

namespace TravelExperience.Api;

internal sealed record AuthUserRow(
  Guid Id,
  string Identifier,
  string Channel,
  DateTimeOffset CreatedAt,
  DateTimeOffset? LastLoginAt);

internal sealed record UserProfileRow(
  Guid UserId,
  string? Name,
  string? HomeCity,
  string? Budget,
  string[] Interests,
  DateTimeOffset UpdatedAt);

internal sealed record OtpChallengeRow(
  Guid Id,
  string ChallengeId,
  Guid UserId,
  string Identifier,
  string Channel,
  string CodeHash,
  DateTimeOffset CreatedAt,
  DateTimeOffset ExpiresAt,
  DateTimeOffset? ConsumedAt);

internal abstract record ChallengeVerificationOutcome
{
  public sealed record Success(Guid UserId, string Identifier, string Channel, DateTimeOffset SessionExpiresAt, bool IsNewUser) : ChallengeVerificationOutcome;
  public sealed record NotFound : ChallengeVerificationOutcome;
  public sealed record Expired : ChallengeVerificationOutcome;
  public sealed record InvalidCode : ChallengeVerificationOutcome;
}

internal sealed class PostgresAuthStore
{
  private readonly NpgsqlDataSource _dataSource;

  public PostgresAuthStore(NpgsqlDataSource dataSource)
  {
    _dataSource = dataSource;
  }

  public async Task InitializeAsync(CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

    var createSchemaCommand = connection.CreateCommand();
    createSchemaCommand.CommandText = """
      create table if not exists auth_users (
        id uuid primary key,
        identifier text not null,
        channel text not null,
        created_at timestamptz not null,
        last_login_at timestamptz null,
        unique(identifier, channel)
      );

      create table if not exists otp_challenges (
        id uuid primary key,
        challenge_id text not null unique,
        user_id uuid not null references auth_users(id) on delete cascade,
        identifier text not null,
        channel text not null,
        code_hash text not null,
        created_at timestamptz not null,
        expires_at timestamptz not null,
        consumed_at timestamptz null
      );

      create index if not exists ix_otp_challenges_identifier_channel
        on otp_challenges(identifier, channel);

      create table if not exists user_profiles (
        user_id uuid primary key references auth_users(id) on delete cascade,
        name text null,
        home_city text null,
        budget text null,
        interests text[] not null default '{}',
        updated_at timestamptz not null
      );

      create table if not exists user_sessions (
        token text primary key,
        user_id uuid not null references auth_users(id) on delete cascade,
        expires_at timestamptz not null,
        created_at timestamptz not null
      );

      create index if not exists ix_user_sessions_user_id on user_sessions(user_id);
      """;

    await createSchemaCommand.ExecuteNonQueryAsync(cancellationToken);
  }

  public async Task<AuthUserRow> UpsertUserAsync(string identifier, string channel, DateTimeOffset createdAt, CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      insert into auth_users (id, identifier, channel, created_at, last_login_at)
      values (@id, @identifier, @channel, @created_at, null)
      on conflict (identifier, channel)
      do update set identifier = excluded.identifier
      returning id, identifier, channel, created_at, last_login_at;
      """;

    command.Parameters.AddWithValue("id", Guid.NewGuid());
    command.Parameters.AddWithValue("identifier", identifier);
    command.Parameters.AddWithValue("channel", channel);
    command.Parameters.AddWithValue("created_at", createdAt);

    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
    if (!await reader.ReadAsync(cancellationToken))
    {
      throw new InvalidOperationException("Unable to upsert auth user.");
    }

    return new AuthUserRow(
      reader.GetGuid(0),
      reader.GetString(1),
      reader.GetString(2),
      ReadUtcOffset(reader, 3),
      reader.IsDBNull(4) ? null : ReadUtcOffset(reader, 4));
  }

  public async Task InsertChallengeAsync(
    AuthUserRow user,
    string challengeId,
    string codeHash,
    DateTimeOffset createdAt,
    DateTimeOffset expiresAt,
    CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      insert into otp_challenges (
        id,
        challenge_id,
        user_id,
        identifier,
        channel,
        code_hash,
        created_at,
        expires_at,
        consumed_at
      ) values (
        @id,
        @challenge_id,
        @user_id,
        @identifier,
        @channel,
        @code_hash,
        @created_at,
        @expires_at,
        null
      );
      """;

    command.Parameters.AddWithValue("id", Guid.NewGuid());
    command.Parameters.AddWithValue("challenge_id", challengeId);
    command.Parameters.AddWithValue("user_id", user.Id);
    command.Parameters.AddWithValue("identifier", user.Identifier);
    command.Parameters.AddWithValue("channel", user.Channel);
    command.Parameters.AddWithValue("code_hash", codeHash);
    command.Parameters.AddWithValue("created_at", createdAt);
    command.Parameters.AddWithValue("expires_at", expiresAt);

    await command.ExecuteNonQueryAsync(cancellationToken);
  }

  public async Task<OtpChallengeRow?> GetChallengeAsync(string challengeId, CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      select id, challenge_id, user_id, identifier, channel, code_hash, created_at, expires_at, consumed_at
      from otp_challenges
      where challenge_id = @challenge_id
      limit 1;
      """;

    command.Parameters.AddWithValue("challenge_id", challengeId);

    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
    if (!await reader.ReadAsync(cancellationToken))
    {
      return null;
    }

    return new OtpChallengeRow(
      reader.GetGuid(0),
      reader.GetString(1),
      reader.GetGuid(2),
      reader.GetString(3),
      reader.GetString(4),
      reader.GetString(5),
      ReadUtcOffset(reader, 6),
      ReadUtcOffset(reader, 7),
      reader.IsDBNull(8) ? null : ReadUtcOffset(reader, 8));
  }

  public async Task<ChallengeVerificationOutcome> TryConsumeChallengeAsync(string challengeId, string expectedCodeHash, DateTimeOffset now, CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    Guid? userId = null;
    string? identifier = null;
    string? channel = null;

    await using (var consumeCommand = connection.CreateCommand())
    {
      consumeCommand.CommandText = """
        update otp_challenges
        set consumed_at = @consumed_at
        where challenge_id = @challenge_id
          and consumed_at is null
          and expires_at >= @consumed_at
          and code_hash = @code_hash
        returning user_id, identifier, channel;
        """;

      consumeCommand.Parameters.AddWithValue("consumed_at", now);
      consumeCommand.Parameters.AddWithValue("challenge_id", challengeId);
      consumeCommand.Parameters.AddWithValue("code_hash", expectedCodeHash);

      await using var reader = await consumeCommand.ExecuteReaderAsync(cancellationToken);
      if (await reader.ReadAsync(cancellationToken))
      {
        userId = reader.GetGuid(0);
        identifier = reader.GetString(1);
        channel = reader.GetString(2);
      }
    }

    if (userId is null)
    {
      await using var stateCommand = connection.CreateCommand();
      stateCommand.CommandText = """
        select consumed_at, expires_at, code_hash
        from otp_challenges
        where challenge_id = @challenge_id
        limit 1;
        """;
      stateCommand.Parameters.AddWithValue("challenge_id", challengeId);

      await using var stateReader = await stateCommand.ExecuteReaderAsync(cancellationToken);
      if (!await stateReader.ReadAsync(cancellationToken))
      {
        return new ChallengeVerificationOutcome.NotFound();
      }

      if (!stateReader.IsDBNull(0))
      {
        return new ChallengeVerificationOutcome.NotFound();
      }

      var expiresAt = ReadUtcOffset(stateReader, 1);
      if (expiresAt < now)
      {
        return new ChallengeVerificationOutcome.Expired();
      }

      var codeHash = stateReader.GetString(2);
      if (!string.Equals(codeHash, expectedCodeHash, StringComparison.Ordinal))
      {
        return new ChallengeVerificationOutcome.InvalidCode();
      }

      return new ChallengeVerificationOutcome.NotFound();
    }

    bool isNewUser;
    await using (var loginCommand = connection.CreateCommand())
    {
      loginCommand.CommandText = """
        update auth_users
        set last_login_at = @last_login_at
        where id = @user_id
        returning (last_login_at = @last_login_at) as is_first_login;
        """;

      loginCommand.Parameters.AddWithValue("last_login_at", now);
      loginCommand.Parameters.AddWithValue("user_id", userId.Value);

      await using var loginReader = await loginCommand.ExecuteReaderAsync(cancellationToken);
      await loginReader.ReadAsync(cancellationToken);
      isNewUser = loginReader.GetBoolean(0);
    }

    return new ChallengeVerificationOutcome.Success(userId.Value, identifier!, channel!, now.AddHours(8), isNewUser);
  }

  private static DateTimeOffset ReadUtcOffset(NpgsqlDataReader reader, int ordinal)
  {
    var value = DateTime.SpecifyKind(reader.GetDateTime(ordinal), DateTimeKind.Utc);
    return new DateTimeOffset(value);
  }

  public async Task<UserProfileRow?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      select user_id, name, home_city, budget, interests, updated_at
      from user_profiles
      where user_id = @user_id
      limit 1;
      """;
    command.Parameters.AddWithValue("user_id", userId);

    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
    if (!await reader.ReadAsync(cancellationToken)) return null;

    return new UserProfileRow(
      reader.GetGuid(0),
      reader.IsDBNull(1) ? null : reader.GetString(1),
      reader.IsDBNull(2) ? null : reader.GetString(2),
      reader.IsDBNull(3) ? null : reader.GetString(3),
      reader.GetFieldValue<string[]>(4),
      ReadUtcOffset(reader, 5));
  }

  public async Task<UserProfileRow> UpsertProfileAsync(Guid userId, string? name, string? homeCity, string? budget, string[] interests, CancellationToken cancellationToken = default)
  {
    var now = DateTimeOffset.UtcNow;
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      insert into user_profiles (user_id, name, home_city, budget, interests, updated_at)
      values (@user_id, @name, @home_city, @budget, @interests, @updated_at)
      on conflict (user_id) do update
        set name = excluded.name,
            home_city = excluded.home_city,
            budget = excluded.budget,
            interests = excluded.interests,
            updated_at = excluded.updated_at
      returning user_id, name, home_city, budget, interests, updated_at;
      """;
    command.Parameters.AddWithValue("user_id", userId);
    command.Parameters.AddWithValue("name", (object?)name ?? DBNull.Value);
    command.Parameters.AddWithValue("home_city", (object?)homeCity ?? DBNull.Value);
    command.Parameters.AddWithValue("budget", (object?)budget ?? DBNull.Value);
    command.Parameters.AddWithValue("interests", interests);
    command.Parameters.AddWithValue("updated_at", now);

    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
    await reader.ReadAsync(cancellationToken);

    return new UserProfileRow(
      reader.GetGuid(0),
      reader.IsDBNull(1) ? null : reader.GetString(1),
      reader.IsDBNull(2) ? null : reader.GetString(2),
      reader.IsDBNull(3) ? null : reader.GetString(3),
      reader.GetFieldValue<string[]>(4),
      ReadUtcOffset(reader, 5));
  }

  public async Task<AuthUserRow?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      select id, identifier, channel, created_at, last_login_at
      from auth_users
      where id = @id
      limit 1;
      """;
    command.Parameters.AddWithValue("id", userId);

    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
    if (!await reader.ReadAsync(cancellationToken)) return null;

    return new AuthUserRow(
      reader.GetGuid(0),
      reader.GetString(1),
      reader.GetString(2),
      ReadUtcOffset(reader, 3),
      reader.IsDBNull(4) ? null : ReadUtcOffset(reader, 4));
  }

  public async Task StoreSessionAsync(string token, Guid userId, DateTimeOffset expiresAt, CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      insert into user_sessions (token, user_id, expires_at, created_at)
      values (@token, @user_id, @expires_at, @created_at)
      on conflict (token) do nothing;
      """;
    command.Parameters.AddWithValue("token", token);
    command.Parameters.AddWithValue("user_id", userId);
    command.Parameters.AddWithValue("expires_at", expiresAt);
    command.Parameters.AddWithValue("created_at", DateTimeOffset.UtcNow);
    await command.ExecuteNonQueryAsync(cancellationToken);
  }

  public async Task<Guid?> ResolveSessionAsync(string token, CancellationToken cancellationToken = default)
  {
    await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
    await using var command = connection.CreateCommand();
    command.CommandText = """
      select user_id from user_sessions
      where token = @token and expires_at > now()
      limit 1;
      """;
    command.Parameters.AddWithValue("token", token);
    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
    if (!await reader.ReadAsync(cancellationToken)) return null;
    return reader.GetGuid(0);
  }
}