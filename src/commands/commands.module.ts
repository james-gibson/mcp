import { Module } from '@nestjs/common';
import { CommandFactory } from './command.factory';
import { CreateServerCommand } from './create-server.command';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [McpModule],
  providers: [CommandFactory, CreateServerCommand],
  exports: [CommandFactory],
})
export class CommandsModule {}
