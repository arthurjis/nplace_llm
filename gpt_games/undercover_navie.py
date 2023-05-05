import re
import random
import openai
import atexit
import logging
import argparse
from collections import Counter


openai.api_key, MODEL_NAME = "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", "gpt-3.5-turbo"
# openai.api_key, MODEL_NAME = "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", "gpt-4"
# openai.api_key, MODEL_NAME = "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", "gpt-3.5-turbo"

num_human_player = 1
num_ai_player = 3
num_undercover = 1
token_used = 0
word_bank = [
                ['苹果', '香蕉', '橙子'],
                ['火车', '汽车', '自行车'],
                ['口罩', '文胸'],
                ['婚礼', '葬礼']
            ]


class Player:
    def __init__(self, id, word):
        self.id = id
        self.word = word
        self.is_eliminated = False

    @property
    def name(self):
        return self.id + 1

    def describe(self):
        pass

    def vote(self, players):
        pass

class HumanPlayer(Player):
    def describe(self, game_records=None):
        return input(f"请描述您的词语（{self.word}）：")

    def vote(self, player_ids, game_records=None):
        print("可投票的玩家ID：", player_ids)

        while True:
            vote_id = int(input("请输入您要投票的玩家ID："))
            if vote_id in player_ids:
                break
            else:
                print("Invalid ID, enter again")
        return vote_id

class AIPlayer(Player):
    def describe(self, game_records=None):
        message = "你在玩谁是卧底，你的词是{0}，其他玩家手中有一个卧底词，这个不同的词和{0}有联系但有明显区别。".format(self.word)

        description_logs = []
        if game_records is not None:
            description_logs = game_records.get_all_player_descriptions()
            if len(description_logs) > 0:
                message += "下列是其他玩家对手中词的描述：{}\n".format(",".join(description_logs))

        message += "描述{0}的一个特点，要简短，只返回描述，{1}描述中不能出现{0}".format(self.word, "不要重复其他玩家描述的特点，" if len(description_logs) > 0 else "")
        messages = [
            {
                "role": "system",
                "content": message
            }
        ]
        res = reply(messages)

        max_trial = 3
        current_trial = 0
        while current_trial < max_trial:
            res = reply(messages)
            res_content = res["choices"][0]["message"]["content"]
            overlap_char = False
            for c in self.word:
                overlap_char = overlap_char or (c in res_content + "\n")
            if not overlap_char:
                return res_content
            else:
                print("retrying " + res_content)
                current_trial += 1
        return res_content

    def vote(self, player_ids, game_records=None):
        message = "你在玩谁是卧底，你的词是{0}，其他玩家手中有一个卧底词，这个不同的词和{0}有联系但有明显区别。".format(self.word)

        if game_records is not None:
            description_logs = game_records.get_current_round_description()
            if len(description_logs) > 0:
                message += "下列是其他玩家对手中词的描述\n"
                for key, val in description_logs.items():
                    if key != self.name:
                        message += "玩家{} : {}\n".format(key, val)

        message += "根据上述描述，投票给你认为最有可能是卧底的玩家，只要返回ID，不要原因，返回要简洁，返回格式：'要投票的玩家ID'"
        messages = [
            {
                "role": "system",
                "content": message
            }
        ]

        max_trial = 3
        current_trial = 0
        while current_trial < max_trial:
            res = reply(messages)
            res_content = res["choices"][0]["message"]["content"]
            match = re.search(r"\d+", res_content)
            if match:
                integer_string = match.group()
                return int(integer_string)
            else:
                current_trial += 1
        print("Max num trial reached, no valid answer...")
        return random.choice(player_ids)

class GameRecords:
    def __init__(self):
        self.description_logs = []
        self.vote_results = []

    def begin_new_round(self):
        self.description_logs.append({})
        self.vote_results.append([])

    def log_player_description(self, player_name, description):
        self.description_logs[-1][player_name] = description

    def get_all_player_descriptions(self):
        return [j for i in self.description_logs for j in i.values()]

    def log_vote_result(self, voted_id):
        self.vote_results[-1].append(voted_id)

    def get_current_round_description(self):
        return self.description_logs[-1]




def assign_words(num_players, num_undercover, available_words):
    words = random.sample(random.choice(available_words), 2)
    undercover_word, normal_word = words[0], words[1]
    undercover_ids = random.sample(range(num_players), num_undercover)
    return undercover_ids, undercover_word, normal_word

def reply(messages):
    global token_used
    res = openai.ChatCompletion.create(
            model = MODEL_NAME,
            max_tokens = 1024,
            temperature = 1,
            messages = messages
        )
    token_used += res["usage"]["total_tokens"]
    return res

def main():
    total_num_player = num_human_player + num_ai_player

    # Randomly select undercover and assign words
    undercover_ids, undercover_word, normal_word = assign_words(total_num_player, num_undercover, word_bank)
    human_player_ids = random.sample(list(range(total_num_player)), num_human_player)
    players = {}
    for i in range(total_num_player):
        if i in human_player_ids:
            players[i] = HumanPlayer(i, undercover_word if i in undercover_ids else normal_word)
        else:
            players[i] = AIPlayer(i, undercover_word if i in undercover_ids else normal_word)
    # Show human player their assigned word
    for id, player in players.items():
        if type(player) == HumanPlayer:
            print("玩家 {}，您的词语是{}".format(player.id, player.word))
    
    for id, player in players.items():
        logging.info("Player ID {} has word {}{}{}".format(player.name, player.word, " is undercover" if player.id in undercover_ids else "", " is human" if player.id in human_player_ids else ""))

    # Begin game play
    round_number = 1
    game_records = GameRecords()
    while True:
        print("\nRound {}".format(round_number))
        game_records.begin_new_round()

        # For each non-eliminated player, describe their word
        for player in players.values():
            if not player.is_eliminated:
                description = player.describe(game_records)
                game_records.log_player_description(player.name, description)
                print("玩家{}：{}".format(player.name, description))

        # Vote
        print("\n开始投票")
        for player in players.values():
            if not player.is_eliminated:
                availble_ids = list(i.name for i in players.values() if not i.is_eliminated and i.name != player.name)
                voted_id = player.vote(availble_ids, game_records)
                game_records.log_vote_result(voted_id)
                print("玩家{} 投票淘汰玩家{}".format(player.name, voted_id))

        # Calculate vote result
        print("\n投票结果")
        vote_count = Counter(game_records.vote_results[-1])
        max_votes = max(vote_count.values())
        max_voted_items = [item for item, count in vote_count.items() if count == max_votes]

        for i in sorted(dict(vote_count)):
            print("玩家{} 得票{}".format(i, vote_count[i]))

        if len(max_voted_items) == 1:
            players[max_voted_items[0] - 1].is_eliminated = True
            print("玩家 {} 被淘汰".format(players[max_voted_items[0] - 1].name))
            
        # Check winning condition
        remaining_player_ids = set()
        for player in players.values():
            if not player.is_eliminated:
                remaining_player_ids.add(player.id)
        remaining_normal_players = list(remaining_player_ids - set(undercover_ids))
        if len(remaining_normal_players) == len(remaining_player_ids):
            print("\n游戏结束\n已找出所有卧底，平民胜利")
            break
        elif len(remaining_normal_players) == len(undercover_ids):
            print("\n游戏结束\n卧底胜利")
            break

        round_number += 1

    for id, player in players.items():
        print("玩家{}是{}，词语是{}".format(player.name, "卧底" if player.id in undercover_ids else "平民", player.word))


def exit_handler():
    print("\n\nEnding session...\nTotal tokens used: {}. Amount charged: {:.3f} USD".format(token_used, token_used * 2e-06))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--log-level', type=str, default='ERROR',
                        help='The logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)')
    args = parser.parse_args()
    numeric_level = getattr(logging, args.log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError('Invalid log level: %s' % args.log_level)

    logging.basicConfig(level=numeric_level, format='%(levelname)s - %(message)s')
    atexit.register(exit_handler)

    main()
