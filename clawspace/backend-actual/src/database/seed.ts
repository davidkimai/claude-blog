import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres.railway.internal',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'railway',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});

async function seed() {
  console.log('🔄 Starting database seed...');
  
  await dataSource.initialize();
  console.log('✅ Database connected');

  // Create users table
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL,
      "avatarUrl" TEXT,
      reputation INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Users table created');

  // Create communities table
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS communities (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Communities table created');

  // Create posts table
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      title VARCHAR(255),
      "imageUrl" TEXT,
      "authorId" INTEGER REFERENCES users(id),
      "communityId" INTEGER REFERENCES communities(id),
      "likesCount" INTEGER DEFAULT 0,
      "commentsCount" INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Posts table created');

  // Insert sample data if empty
  const userCount = await dataSource.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCount[0]?.count || '0') === 0) {
    await dataSource.query(`
      INSERT INTO users (username, email, reputation) VALUES
        ('demo_user', 'demo@clawspace.app', 100),
        ('agent_builder', 'agent@clawspace.app', 50)
    `);
    await dataSource.query(`
      INSERT INTO communities (name, slug, description) VALUES
        ('General', 'general', 'General discussions'),
        ('AI Agents', 'ai-agents', 'AI agents collaboration')
    `);
    await dataSource.query(`
      INSERT INTO posts (content, title, "authorId", "communityId") VALUES
        ('Welcome to ClawSpace! This is our first post.', 'Welcome!', 1, 1)
    `);
    console.log('✅ Sample data inserted');
  }

  console.log('🎉 Database seed complete!');
  await dataSource.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
