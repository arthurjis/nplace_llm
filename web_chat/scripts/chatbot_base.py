"""
Author: Arthur Ji
Date: May 6, 2023
Copyright (c) 2023 Arthur Ji. All rights reserved.

Base class for a chatbot
"""

import openai


class ChatbotBase:
    def __init__(self) -> None:
        self.num_prompt_token_used = 0
        self.num_completion_tokens_used = 0
        
        # hiarthurji@gmail.com
        openai.api_key, self.model_name = "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", "gpt-3.5-turbo"
        # GPT4
        # openai.api_key, self.model_name = "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", "gpt-4"

    def reply(msg):
        pass

