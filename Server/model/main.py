import cv2

from detect_multi_threaded import DefaultConfig
from detect_multi_threaded import Model
from utils.detector_utils import WebcamVideoStream

args = DefaultConfig().get_args()

video_capture = WebcamVideoStream(src=args.video_source,
                                  width=args.width,
                                  height=args.height).start()

model = Model()
model.load_model()
while True:
    frame = video_capture.read()
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    score = model.inference_frame(frame)
    print(score)
