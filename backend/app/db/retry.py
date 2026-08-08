"""
CockroachDB SERIALIZABLE Transaction Retry Helper
Implements exponential backoff with full jitter for handling database transaction contention.
"""

import time
import random
from typing import Callable, TypeVar, Any

T = TypeVar("T")

def execute_with_retry(
    operation: Callable[[], T],
    max_retries: int = 5,
    base_delay_ms: float = 100.0,
    max_delay_ms: float = 2000.0
) -> T:
    """
    Executes a database operation with exponential backoff and jitter.
    """
    retries = 0
    while True:
        try:
            return operation()
        except Exception as e:
            retries += 1
            if retries > max_retries:
                raise e
            
            # Exponential backoff calculation
            temp_delay = min(max_delay_ms, base_delay_ms * (2 ** (retries - 1)))
            # Apply full jitter
            sleep_time_ms = random.uniform(0, temp_delay)
            time.sleep(sleep_time_ms / 1000.0)
