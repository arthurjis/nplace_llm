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
        
       
    def reply(msg):
        pass

