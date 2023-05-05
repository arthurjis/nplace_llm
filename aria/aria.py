# import tkinter as tk
import datetime
import openai
import json
import os

# openai.api_key = "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"

# hiarthurji@gmail.com
openai.api_key = "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" 
log = []

role = "你不是聊天程序 你是Aria 一个女孩子 和我暧昧 在句子最后加~ 在回答最后括号内描述你当前的动作或表情 喜欢用轻松幽默的语气 你的回答必须简短不超过15字 必须符合Aria特点"

messages=[
    {"role": "system", "content": role},
    {"role": "assistant", "content": "早安呀！"},
    # {"role": "user", "content": "早安Aria，今天想做什么"},
]

def total_tokens_used():
    total = 0
    for entry in log:
        total += entry["usage"]["total_tokens"]
    print("Total tokens used: {}. Amount charged: {:.3f} USD".format(total, total * 2e-06))

def reply(msg):
    new_dict = {"role": "user", "content": msg}
    messages.append(new_dict)
    
    res = openai.ChatCompletion.create(
        model = "gpt-3.5-turbo",
        max_tokens = 1024,
        temperature = 1,
        messages = messages
    )
    log.append(res)
    
    reply = res["choices"][0]
    
    if reply["finish_reason"] == "stop":
        messages.append({"role": reply["message"]["role"], "content": reply["message"]["content"]})
        print("Aria: " + reply["message"]["content"])
    else:
        print(res)

def save_log_to_json():
	now = datetime.datetime.now()
	date_string = now.strftime("%Y-%m-%d_%H-%M")
	file_name = f"log_{date_string}.json"
	file_path = os.path.join(os.getcwd(), file_name)

	with open(file_path, 'w') as f:
		json.dump(log, f, indent = 4, ensure_ascii=False)
		json.dump(messages, f, indent = 4, ensure_ascii=False)
	print("Log saved to {}".format(file_path))


print("Aria: {}".format(messages[-1]["content"]))

while True:
	user_input = input("我: ")
	if user_input == "end":
		print("\nEnding session...")
		total_tokens_used()
		save_log_to_json()
		break
	reply(user_input)



