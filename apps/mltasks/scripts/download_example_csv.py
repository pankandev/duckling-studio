import os

import kagglehub  # type: ignore
import pandas as pd
from kagglehub.exceptions import UnauthenticatedError  # type: ignore


# Download latest version


def main():
    try:
        kagglehub.auth.whoami()
    except UnauthenticatedError:
        kagglehub.auth.login()

    path = kagglehub.dataset_download("datatattle/covid-19-nlp-text-classification")
    csv_path = os.path.join(path, 'Corona_NLP_train.csv')
    df = pd.read_csv(csv_path, sep=',', encoding='latin-1')
    df = df.rename(columns={
        'OriginalTweet': 'text',
        'Sentiment': 'label'
    })

    df[['text', 'label']].to_csv('./data/text.csv', index=False, encoding='utf-8')


if __name__ == '__main__':
    main()
