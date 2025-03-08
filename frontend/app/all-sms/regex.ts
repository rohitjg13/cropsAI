export function extractTransactionAmount(message: string): string | null {
    if (!message) return null;

    const lowerMessage = message.toLowerCase();

    const highWeightKeywords = ["credited", "debited", "paid", "received", "withdrawn", "deposited"];
    const lowWeightKeywords = ["balance", "available", "transaction", "amount"];
    const allKeywords = [...highWeightKeywords, ...lowWeightKeywords];

    const amountPattern = /(?:[Rs.$€]\s*)?\d+(?:,\d+)*(?:\.\d{1,2})?(?:\s*[A-Z]{3})?/g;
    
    for (const keyword of highWeightKeywords) {
      const pattern = new RegExp(`${keyword}\\s+(?:with|by|for)?\\s*(${amountPattern.source})`, 'i');
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    const matches = Array.from(message.matchAll(new RegExp(amountPattern, 'g')));
    if (!matches.length) return null;
    
    interface AmountScore {
      amount: string;
      score: number;
    }
    
    const scores: AmountScore[] = matches.map(match => {
      const amount = match[0];
      let score = 0;
      
      if (/[Rs.$€]/.test(amount)) score += 1;
      if (/[A-Z]{3}$/.test(amount)) score += 1;
      if (amount.includes('.')) score += 1;
      
      const start = match.index || 0;
      const end = start + amount.length;
      const leftContext = message.substring(Math.max(0, start - 20), start).toLowerCase();
      const rightContext = message.substring(end, end + 20).toLowerCase();
      
      for (const keyword of allKeywords) {
        if (leftContext.includes(keyword) || rightContext.includes(keyword)) {
          score += highWeightKeywords.includes(keyword) ? 2 : 1;
          break;
        }
      }
      
      return { amount, score };
    });
    
    if (scores.length === 0) return null;
    
    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return bestMatch.amount;
  }