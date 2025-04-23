import typing


class AppError(Exception):
    def __init__(self, status_code: int, error_code: str, details: dict[str, typing.Any], message: str):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details


    def to_json(self):
        return {
            "message": self.message,
            "code": self.error_code,
            "details": self.details
        }
