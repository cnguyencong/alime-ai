import argparse
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import re
import os
from tqdm import tqdm

def parse_srt_time(time_str):
    """Parse SRT timestamp"""
    return time_str.strip()

def split_srt_block(block):
    """Split an SRT block into its components"""
    lines = block.strip().split('\n')
    if len(lines) >= 3:
        idx = lines[0]
        timestamp = lines[1]
        text = '\n'.join(lines[2:])
        return idx, timestamp, text
    return None

def translate_text(text, model, tokenizer, device, max_length=512):
    """Translate text using the specified model"""
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model.generate(**inputs, max_length=max_length, num_beams=5, length_penalty=1.0)
    
    translation = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return translation

def translate_srt(
    input_file,
    output_file,
    model_name,
    batch_size=8,
    device=None
):
    """
    Translate an SRT file using a Hugging Face translation model
    
    Parameters:
    - input_file: Path to input SRT file
    - output_file: Path to output translated SRT file
    - model_name: Name of the Hugging Face model to use
    - batch_size: Number of segments to translate at once
    - device: Device to use for translation (cuda/cpu)
    """
    
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    
    print(f"\nUsing device: {device}")
    if device == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    
    # Load model and tokenizer
    print(f"\nLoading model: {model_name}")
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Read input SRT file
    print("\nReading SRT file...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into blocks
    blocks = re.split('\n\n+', content.strip())
    translated_blocks = []
    
    print("\nTranslating...")
    for i in tqdm(range(0, len(blocks), batch_size)):
        batch_blocks = blocks[i:i + batch_size]
        batch_translations = []
        
        for block in batch_blocks:
            parsed = split_srt_block(block)
            if parsed:
                idx, timestamp, text = parsed
                translation = translate_text(text, model, tokenizer, device)
                translated_block = f"{idx}\n{timestamp}\n{translation}"
                batch_translations.append(translated_block)
        
        translated_blocks.extend(batch_translations)
    
    # Write translated SRT
    print("\nWriting translated SRT file...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(translated_blocks))
    
    print(f"\nTranslation completed! Output saved to: {output_file}")
    return output_file

def main():
    parser = argparse.ArgumentParser(description='Translate SRT files using Hugging Face models')
    parser.add_argument('input_file', help='Path to input SRT file')
    parser.add_argument('--model', default='facebook/nllb-200-distilled-600M',
                      help='Hugging Face model to use for translation')
    parser.add_argument('--output-dir', default=None,
                      help='Directory to save translated file (default: same as input)')
    parser.add_argument('--batch-size', type=int, default=8,
                      help='Number of segments to translate at once')
    parser.add_argument('--device', choices=['cuda', 'cpu'], default=None,
                      help='Device to use for translation')
    
    args = parser.parse_args()
    
    # Set output file path
    if args.output_dir:
        os.makedirs(args.output_dir, exist_ok=True)
        output_file = os.path.join(
            args.output_dir,
            f"{os.path.splitext(os.path.basename(args.input_file))[0]}_translated.srt"
        )
    else:
        output_file = os.path.splitext(args.input_file)[0] + '_translated.srt'
    
    # Translate
    translate_srt(
        args.input_file,
        output_file,
        args.model,
        args.batch_size,
        args.device
    )

if __name__ == "__main__":
    main()
