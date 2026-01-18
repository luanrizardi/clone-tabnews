import database from "infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  // 1. Versão do Postgres
  const databaseVersionResult = await database.query("SHOW server_version;");

  // 2. Máximo de conexões permitidas
  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseName = process.env.POSTGRES_DB;
  const openedConections = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  response.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionResult.rows[0].server_version,
        max_connections: parseInt(
          databaseMaxConnectionsResult.rows[0].max_connections,
        ),
        opened_connections: openedConections.rows[0].count,
      },
    },
  });
}

export default status;
