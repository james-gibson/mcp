import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
import { McpModule } from './mcp/mcp.module';
import { TemplatingModule } from './templating/templating.module';

@Module({
  imports: [CommandsModule, McpModule, TemplatingModule],
})
export class AppModule {}
