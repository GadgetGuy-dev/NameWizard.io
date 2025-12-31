import { fileLogger } from './logger';

/**
 * Options for batch processing
 */
export interface BatchProcessorOptions<T, R> {
  /**
   * The batch size to process at once
   * @default 5
   */
  batchSize?: number;
  
  /**
   * The delay between batches in milliseconds
   * @default 100
   */
  batchDelay?: number;
  
  /**
   * Maximum number of retries for failed items
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Delay before retrying a failed item (in milliseconds)
   * @default 500
   */
  retryDelay?: number;
  
  /**
   * Whether to continue processing if an item fails
   * @default true
   */
  continueOnError?: boolean;
  
  /**
   * Callback when a batch starts processing
   */
  onBatchStart?: (batchIndex: number, items: T[]) => void;
  
  /**
   * Callback when a batch completes processing
   */
  onBatchComplete?: (batchIndex: number, results: (R | Error)[]) => void;
  
  /**
   * Callback when an item fails processing after all retries
   */
  onItemFailure?: (item: T, error: Error, retryCount: number) => void;
  
  /**
   * Callback when an item successfully processes
   */
  onItemSuccess?: (item: T, result: R) => void;
  
  /**
   * Callback for progress updates
   */
  onProgress?: (processed: number, total: number, failed: number) => void;
}

/**
 * Process an array of items in batches
 */
export async function batchProcess<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  options: BatchProcessorOptions<T, R> = {}
): Promise<(R | Error)[]> {
  const {
    batchSize = 5,
    batchDelay = 100,
    maxRetries = 3,
    retryDelay = 500,
    continueOnError = true,
    onBatchStart,
    onBatchComplete,
    onItemFailure,
    onItemSuccess,
    onProgress
  } = options;
  
  // Clone the items array to avoid modifying the original
  const itemsToProcess = [...items];
  const total = itemsToProcess.length;
  const results: (R | Error)[] = new Array(total);
  let processed = 0;
  let failed = 0;
  
  // Process all items in batches
  for (let batchIndex = 0; batchIndex < Math.ceil(total / batchSize); batchIndex++) {
    // Get the current batch
    const startIdx = batchIndex * batchSize;
    const endIdx = Math.min(startIdx + batchSize, total);
    const batch = itemsToProcess.slice(startIdx, endIdx);
    
    fileLogger.debug(`Processing batch ${batchIndex + 1}/${Math.ceil(total / batchSize)}`);
    
    // Notify batch start
    if (onBatchStart) {
      onBatchStart(batchIndex, batch);
    }
    
    // Process all items in the batch concurrently
    const batchPromises = batch.map(async (item, idx) => {
      const itemIndex = startIdx + idx;
      let result: R | Error;
      let retryCount = 0;
      
      while (true) {
        try {
          // Process the item
          result = await processFn(item);
          
          // Store the result
          results[itemIndex] = result;
          processed++;
          
          // Notify item success
          if (onItemSuccess) {
            onItemSuccess(item, result);
          }
          
          break; // Success, exit retry loop
        } catch (error) {
          // Increment retry count
          retryCount++;
          
          fileLogger.warn(`Error processing item at index ${itemIndex} (retry ${retryCount}/${maxRetries})`, { error });
          
          // Check if we should retry
          if (retryCount < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          } else {
            // Max retries reached, store error and continue
            const finalError = error instanceof Error ? error : new Error(String(error));
            results[itemIndex] = finalError;
            processed++;
            failed++;
            
            // Notify item failure
            if (onItemFailure) {
              onItemFailure(item, finalError, retryCount);
            }
            
            // If continueOnError is false, throw the error to stop processing
            if (!continueOnError) {
              throw finalError;
            }
            
            break; // Exit retry loop
          }
        }
      }
      
      // Notify progress
      if (onProgress) {
        onProgress(processed, total, failed);
      }
      
      return results[itemIndex];
    });
    
    try {
      // Wait for all items in the batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Notify batch complete
      if (onBatchComplete) {
        onBatchComplete(batchIndex, batchResults);
      }
      
      fileLogger.debug(`Batch ${batchIndex + 1} completed: ${batchResults.length} items processed`);
      
      // If this isn't the last batch, wait before processing the next one
      if (batchIndex < Math.ceil(total / batchSize) - 1) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    } catch (error) {
      // If continueOnError is false, a batch item failed and threw an error
      fileLogger.error(`Batch processing stopped due to error`, { error });
      break;
    }
  }
  
  fileLogger.info(`Batch processing completed: ${processed}/${total} items processed, ${failed} failed`);
  
  return results;
}

/**
 * Group an array of items into batches
 */
export function getBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Calculate estimated time remaining in seconds
 */
export function calculateTimeRemaining(
  totalItems: number,
  processedItems: number,
  elapsedTimeMs: number
): number | null {
  if (processedItems === 0 || totalItems === 0) {
    return null;
  }
  
  const itemsRemaining = totalItems - processedItems;
  const timePerItemMs = elapsedTimeMs / processedItems;
  const estimatedTimeRemainingMs = timePerItemMs * itemsRemaining;
  
  return Math.round(estimatedTimeRemainingMs / 1000);
}