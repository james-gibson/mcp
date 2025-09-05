import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { RendererService } from './renderer.service';
import { PreProcessingExpanderService } from './pre-processing-expander.service';
import { PostProcessingExpanderService } from './post-processing-expander.service';
import { TemplateProcessorCommand } from './template-processor.command';

/**
 * Templating module provides S-expression parsing and directive processing
 * Requirement: Modular design with distinct services for each component
 */
@Module({
  providers: [
    ParserService,
    RendererService,
    PreProcessingExpanderService,
    PostProcessingExpanderService,
    TemplateProcessorCommand,
  ],
  exports: [
    ParserService,
    RendererService,
    PreProcessingExpanderService,
    PostProcessingExpanderService,
    TemplateProcessorCommand,
  ],
})
export class TemplatingModule {}
