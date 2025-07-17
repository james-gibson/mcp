import { Module } from '@nestjs/common';
import { McpServerService } from './mcp-server.service';
import { ResourcesService } from './resources.service';
import { ToolsService } from './tools.service';
import { PromptsService } from './prompts.service';

@Module({
  providers: [
    McpServerService,
    ResourcesService,
    ToolsService,
    PromptsService,
  ],
  exports: [McpServerService],
})
export class McpModule {}
