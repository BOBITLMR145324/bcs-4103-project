const axios = require('axios');
const csv = require('csv-parser');
const pool = require('./db');

const BANK_MARKETING_URL = 'https://raw.githubusercontent.com/khatrideepti/Bank-Marketing-Data-Analysis/master/bank-full.csv';

async function batchStreamBankMarketing() {
  const client = await pool.connect();
  console.log("Connected to PostgreSQL database. Streaming & Batch Inserting UCI Dataset...");

  try {
    const response = await axios({
      method: 'get',
      url: BANK_MARKETING_URL,
      responseType: 'stream'
    });

    const BATCH_SIZE = 1000;
    let batchValues = [];
    let paramIndex = 1;
    let valuePlaceholders = [];
    let totalCount = 0;

    await client.query('BEGIN');

    const parser = response.data.pipe(csv({ separator: ';' }));

    for await (const row of parser) {
      const age = parseInt(row.age) || 30;
      const job = row.job ? row.job.replace(/"/g, '').trim() : 'unknown';
      const marital = row.marital ? row.marital.replace(/"/g, '').trim() : 'single';
      const education = row.education ? row.education.replace(/"/g, '').trim() : 'tertiary';
      const balance = parseFloat(row.balance) || 100.00;
      const housing = row.housing ? row.housing.replace(/"/g, '').trim() : 'no';

      totalCount++;
      const sku = `BANK-CUST-${totalCount}`;
      const name = `Term Deposit Prospect - ${job.toUpperCase()} (${marital})`;
      const price = Math.max(Math.abs(balance), 10.00);

      // Collect batch values
      valuePlaceholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`);
      batchValues.push(sku, name, price, age, JSON.stringify({
        source: 'UCI Bank Marketing Dataset',
        education: education,
        housing_loan: housing,
        marital_status: marital
      }));

      paramIndex += 5;

      // When batch size is reached, perform a single bulk INSERT
      if (batchValues.length / 5 === BATCH_SIZE) {
        const queryText = `
          INSERT INTO products (sku, name, price, stock_quantity, attributes)
          VALUES ${valuePlaceholders.join(', ')}
          ON CONFLICT (sku) DO NOTHING;
        `;
        await client.query(queryText, batchValues);
        console.log(`Batch inserted ${totalCount} records...`);

        // Reset batch
        batchValues = [];
        valuePlaceholders = [];
        paramIndex = 1;
      }
    }

    // Insert remaining leftover rows
    if (batchValues.length > 0) {
      const queryText = `
        INSERT INTO products (sku, name, price, stock_quantity, attributes)
        VALUES ${valuePlaceholders.join(', ')}
        ON CONFLICT (sku) DO NOTHING;
      `;
      await client.query(queryText, batchValues);
    }

    await client.query('COMMIT');
    console.log(`\n SUCCESS! Batch populated all ${totalCount} UCI records in seconds!`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error streaming Bank Marketing data:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

batchStreamBankMarketing();