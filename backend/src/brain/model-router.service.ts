import { Injectable, Logger } from '@nestjs/common';

export type TaskType = 'greeting' | 'spelling' | 'rewrite' | 'summarization' | 'coding' | 'deepResearch' | 'privateKnowledge' | 'unknown';
export type ModelTier = 'local_small_model' | 'local_medium_model' | 'large_model_or_external' | 'rag_plus_local_model' | 'external_with_web';

@Injectable()
export class ModelRouterService {
  private readonly logger = new Logger(ModelRouterService.name);

  // Simple heuristic detection (in real app, this could be an NLP classifier or lightweight local LLM call)
  detectTaskType(message: string): TaskType {
    const text = message.toLowerCase().trim();
    
    const greetings = ['هلا', 'مرحبا', 'مرحب', 'السلام', 'hello', 'hi', 'hey'];
    if (text.split(/\s+/).length <= 3 && greetings.some(g => text.includes(g))) {
      return 'greeting';
    }

    if (text.includes('صحح') || text.includes('املاء') || text.includes('spelling') || text.includes('correct')) {
      return 'spelling';
    }

    if (text.includes('كود') || text.includes('برمج') || text.includes('code') || text.includes('function')) {
      return 'coding';
    }

    if (text.includes('لخص') || text.includes('خلاصة') || text.includes('summarize')) {
      return 'summarization';
    }

    if (text.includes('ابحث') || text.includes('بحث عميق') || text.includes('search')) {
      return 'deepResearch';
    }

    // Default fallback
    return 'unknown';
  }

  routeTask(taskType: TaskType): ModelTier {
    switch (taskType) {
      case 'greeting':
      case 'spelling':
        return 'local_small_model';
      case 'rewrite':
      case 'summarization':
        return 'local_medium_model';
      case 'coding':
      case 'deepResearch':
        return 'large_model_or_external';
      case 'privateKnowledge':
        return 'rag_plus_local_model';
      default:
        return 'large_model_or_external'; // Fallback to safe best model
    }
  }

  routeMessage(message: string): { taskType: TaskType; recommendedModelTier: ModelTier } {
    const taskType = this.detectTaskType(message);
    const recommendedModelTier = this.routeTask(taskType);
    
    this.logger.debug(`Routed message to TaskType: ${taskType}, ModelTier: ${recommendedModelTier}`);
    
    return { taskType, recommendedModelTier };
  }
}
