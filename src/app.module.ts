import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [CommandsModule, McpModule],
})
export class AppModule {}
