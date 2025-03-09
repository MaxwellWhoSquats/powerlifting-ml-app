from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model.model import initialize_model, generate_visualizations, predict_attempts
import uvicorn
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
model, label_encoder, df = initialize_model()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    division: str
    bodyweight: float
    sex: int

@app.post("/api/model")
async def use_model(request: PredictRequest, raw_request: Request):
    body = await raw_request.json()
    logger.info(f"Raw request body: {body}")
    try:
        division = request.division
        bodyweight = request.bodyweight
        sex = request.sex

        logger.info(f"Received request: division={division}, bodyweight={bodyweight}, sex={sex}")

        attempt_recommendations = predict_attempts(model, label_encoder, division, bodyweight, sex)
        error_msg, box_plot, heatmap_plot, bar_plot = generate_visualizations(df, division, bodyweight, sex)
        
        if error_msg:
            logger.warning(f"Error in visualizations: {error_msg}")
            return {"error": error_msg}
        
        return {
            "recommendations": attempt_recommendations,
            "visualizations": {
                "box_plot": box_plot,
                "heatmap_plot": heatmap_plot,
                "bar_plot": bar_plot
            }
        }
    except Exception as e:
        logger.error(f"Exception in predict: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)