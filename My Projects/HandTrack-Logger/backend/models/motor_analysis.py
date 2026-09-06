from pydantic import BaseModel


class MotorData(BaseModel):

    stability: str
    precision: str
    select: str
    accuracy: str
    response_time: str