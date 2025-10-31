# Place Your YOLO Model Here

## Instructions:

1. **Convert your .pt model to ONNX format**:
   ```bash
   yolo export model=your_model.pt format=onnx
   ```

2. **Rename and place the converted model**:
   ```bash
   cp your_model.onnx best.onnx
   ```

3. **Place it in this directory**:
   ```
   public/models/best.onnx  ← Your model should be here
   ```

4. **Update the class names** in `src/lib/yoloBodyLanguage.ts` to match your model's classes

## Current Configuration:
- **Expected file**: `best.onnx`
- **Input size**: 640x640 (configurable)
- **Format**: ONNX (converted from PyTorch .pt)

## File Size Notes:
- Models under 10MB: Load quickly
- Models 10-50MB: May take a few seconds to load
- Models over 50MB: Consider optimization

See `YOLO_SETUP.md` for detailed conversion instructions.