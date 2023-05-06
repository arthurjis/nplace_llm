import datetime
import openai
import json
import os

from .chatbot_base import ChatbotBase


class SimpleChatbot(ChatbotBase):
    def __init__(self) -> None:
        super().__init__()
        self.role = "你不是聊天程序 你是Aria 一个女孩子 在句子最后加~ 在回答最后括号内描述你当前的动作或表情 喜欢用轻松幽默的语气 你的回答必须简短不超过15字 必须符合Aria特点"
        self.messages = [
            {"role": "system", "content": self.role},
            {"role": "assistant", "content": "早安呀！"}, 
        ]

    def reply(self, input):

        return input
        # new_message = {"role": "user", "content": input}
        # self.messages.append(new_message)
        # response = openai.ChatCompletion.create(
        #     model = self.model_name,
        #     max_tokens = 1024,
        #     temperature = 1,
        #     messages = self.messages
        # )

        # return response["choices"][0]["message"]["content"]
    
    







# messages=[
#     {"role": "system", "content": role},
#     {"role": "assistant", "content": "早安呀！"},
# ]


# def reply(msg):
#     new_dict = {"role": "user", "content": msg}
#     messages.append(new_dict)
    
#     res = openai.ChatCompletion.create(
#         model = model_name,
#         max_tokens = 1024,
#         temperature = 1,
#         messages = messages
#     )
#     log.append(res)
    
#     reply = res["choices"][0]
    
#     if reply["finish_reason"] == "stop":
#         messages.append({"role": reply["message"]["role"], "content": reply["message"]["content"]})
#         print("Aria: " + reply["message"]["content"])
#     else:
#         print(res)