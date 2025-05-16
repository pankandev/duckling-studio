import typing

from pydantic import BaseModel


class TextClassifierTrainingArguments(BaseModel):
    learning_rate: float = 1e-5
    dropout: float = 0.1
    attention_dropout: float = 0.1
    weight_decay: float = 0.02
    num_train_epochs: int = 7
    model_name: str = "distilbert/distilbert-base-uncased"
    batch_size: int = 16


class TextClassifierConfiguration(BaseModel):
    run_name: str
    dataset_id: int
    labels: list[str]
    training_args: TextClassifierTrainingArguments
