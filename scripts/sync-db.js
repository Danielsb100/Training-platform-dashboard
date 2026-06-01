const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Load variables from .env

const railwayUrl = process.env.railwayUrl || process.env.RAILWAY_URL;
const localContainerName = "training-db-local";
const localDbName = "training_local";
const localUser = "postgres";

console.log('🔄 Iniciando sincronização do banco de dados...');
console.log('📡 Origem (Railway) -> Destino (Local Docker)');

if (!railwayUrl) {
    console.error('❌ ERRO: A variável railwayUrl (ou RAILWAY_URL) não foi encontrada no arquivo .env');
    console.error('Certifique-se de que o arquivo .env existe e contém a URL de conexão do Railway.');
    process.exit(1);
}

try {
    // Verifying if the docker container is running
    console.log('🔍 Verificando se o container local está rodando...');
    try {
        execSync(`docker inspect -f {{.State.Running}} ${localContainerName}`);
    } catch (e) {
        console.error(`❌ O container '${localContainerName}' não está rodando. Por favor, inicie-o com o Docker Desktop ou linha de comando.`);
        process.exit(1);
    }

    // Dump and restore via docker exec using sh -c
    const cmd = `docker exec -i ${localContainerName} sh -c "pg_dump '${railwayUrl}' -c -O | psql -U ${localUser} -d ${localDbName}"`;

    console.log('⏳ Baixando e restaurando dados (isso pode levar alguns segundos)...');
    execSync(cmd, { stdio: 'inherit' });

    console.log('✅ Sincronização concluída com sucesso! Banco local atualizado com os dados do Railway.');
} catch (err) {
    console.error('❌ Falha na sincronização:', err.message);
    process.exit(1);
}
