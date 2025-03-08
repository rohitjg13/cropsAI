import re
import json
import sys

# Define keywords and weights
high_weight_keywords = {"credited": 2, "debited": 2, "paid": 2, "received": 2, "withdrawn": 2, "deposited": 2}
low_weight_keywords = {"balance": 1, "available": 1, "transaction": 1, "amount": 1}
all_keywords = {**high_weight_keywords, **low_weight_keywords}

# General amount pattern
amount_pattern = r"(?:[Rs.$€]\s*)?\d+(?:,\d+)*(?:\.\d{1,2})?(?:\s*[A-Z]{3})?"

# Function to extract transaction amount
def extract_transaction_amount(message):
    # Phase 1: Try specific patterns
    for keyword in high_weight_keywords:
        pattern = rf"{keyword}\s+(?:with|by|for)?\s*({amount_pattern})"
        match = re.search(pattern, message)
        if match:
            return match.group(1)  # Return the captured amount
    
    # Phase 2: Fallback scoring
    matches = list(re.finditer(amount_pattern, message))
    if not matches:
        return None
    
    scores = []
    for match in matches:
        amount = match.group()
        score = 0
        # Check features
        if re.search(r'[Rs.$€]', amount): score += 1
        if re.search(r'[A-Z]{3}$', amount): score += 1
        if '.' in amount: score += 1
        # Check context
        start, end = match.start(), match.end()
        left_context = message[max(0, start-20):start].lower()
        right_context = message[end:end+20].lower()
        for keyword, weight in all_keywords.items():
            if keyword in left_context or keyword in right_context:
                score += weight
                break
        scores.append((amount, score))
    
    # Select highest-scored amount
    return max(scores, key=lambda x: x[1])[0] if scores else None

# Test it
message = sys.argv[1]
amount = extract_transaction_amount(message)
print(json.dumps({"amount": amount}))