import { Module } from '@nestjs/common';
import { CommandFactory } from './command.factory';
import { CreateServerCommand } from './create-server.command';
import { McpModule } from '../mcp/mcp.module';
import { TemplatingModule } from '../templating/templating.module';

@Module({
  imports: [McpModule, TemplatingModule],
  providers: [CommandFactory, CreateServerCommand],
  exports: [CommandFactory],
})
export class CommandsModule {}
