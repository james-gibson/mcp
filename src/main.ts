
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandFactory } from './commands/command.factory';

async function bootstrap() {
  // Create NestJS application without HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const commandFactory = app.get(CommandFactory);
    
    // Execute the CLI commands
    await commandFactory.execute();
    
    // Only close the app if not running a server
    if (!commandFactory.isServerRunning()) {
      await app.close();
    }
  } catch (error) {
    console.error('Error during CLI execution:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
