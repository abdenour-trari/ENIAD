import type { Question, QuestionType } from '../types';

interface Token {
  type: string;
  value: string;
  line: number;
  col: number;
}

class Lexer {
  private input: string;
  private pos = 0;
  private line = 1;
  private col = 1;

  constructor(input: string) {
    this.input = input;
  }

  private peek(): string {
    return this.pos < this.input.length ? this.input[this.pos] : '';
  }

  private advance(): string {
    const char = this.peek();
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return char;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      const char = this.peek();

      // Whitespace
      if (/\s/.test(char)) {
        this.advance();
        continue;
      }

      // Comments (#)
      if (char === '#') {
        while (this.pos < this.input.length && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }

      // Brackets, braces, colons, commas, equals
      if (char === '[') {
        tokens.push({ type: 'LBRACK', value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }
      if (char === ']') {
        tokens.push({ type: 'RBRACK', value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }
      if (char === '{') {
        tokens.push({ type: 'LBRACE', value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }
      if (char === '}') {
        tokens.push({ type: 'RBRACE', value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }
      if (char === ':') {
        tokens.push({ type: 'COLON', value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }
      if (char === ',') {
        tokens.push({ type: 'COMMA', value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }
      if (char === '=') {
        tokens.push({ type: 'EQUALS', value: char, line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Strings (single, double, triple quotes)
      if (char === '"' || char === "'") {
        tokens.push(this.readString());
        continue;
      }

      // Numbers
      if (/[0-9-]/.test(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Identifiers
      if (/[a-zA-Z_]/.test(char)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      throw new Error(`Caractère inattendu '${char}' à la ligne ${this.line}, colonne ${this.col}`);
    }

    tokens.push({ type: 'EOF', value: '', line: this.line, col: this.col });
    return tokens;
  }

  private readString(): Token {
    const startLine = this.line;
    const startCol = this.col;
    const quote = this.advance(); // ' or "
    let isTriple = false;

    // Check for triple quotes: ''' or """
    if (this.peek() === quote) {
      this.advance();
      if (this.peek() === quote) {
        this.advance();
        isTriple = true;
      } else {
        // Empty string: "" or ''
        return { type: 'STRING', value: '', line: startLine, col: startCol };
      }
    }

    let value = '';
    while (this.pos < this.input.length) {
      if (isTriple) {
        if (this.input.startsWith(quote.repeat(3), this.pos)) {
          this.pos += 3;
          this.col += 3;
          return { type: 'STRING', value, line: startLine, col: startCol };
        }
        value += this.advance();
      } else {
        const c = this.peek();
        if (c === quote) {
          this.advance();
          return { type: 'STRING', value, line: startLine, col: startCol };
        }
        if (c === '\n') {
          throw new Error(`Saut de ligne inattendu dans une chaîne simple à la ligne ${this.line}, colonne ${this.col}`);
        }
        if (c === '\\') {
          this.advance(); // Skip backslash
          if (this.pos >= this.input.length) {
            throw new Error(`Caractère d'échappement non terminé à la ligne ${this.line}, colonne ${this.col}`);
          }
          const next = this.advance();
          if (next === 'n') value += '\n';
          else if (next === 't') value += '\t';
          else if (next === 'r') value += '\r';
          else value += next;
        } else {
          value += this.advance();
        }
      }
    }

    throw new Error(`Chaîne non fermée (commencée à la ligne ${startLine}, colonne ${startCol})`);
  }

  private readNumber(): Token {
    const startLine = this.line;
    const startCol = this.col;
    let value = '';

    if (this.peek() === '-') {
      value += this.advance();
    }

    let hasDot = false;
    while (this.pos < this.input.length) {
      const c = this.peek();
      if (/[0-9]/.test(c)) {
        value += this.advance();
      } else if (c === '.' && !hasDot) {
        hasDot = true;
        value += this.advance();
      } else {
        break;
      }
    }

    return { type: 'NUMBER', value, line: startLine, col: startCol };
  }

  private readIdentifier(): Token {
    const startLine = this.line;
    const startCol = this.col;
    let value = '';
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: 'IDENTIFIER', value, line: startLine, col: startCol };
  }
}

class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    const tok = this.peek();
    if (tok.type !== 'EOF') this.current++;
    return tok;
  }

  private match(type: string): boolean {
    if (this.peek().type === type) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: string, message: string): Token {
    const tok = this.peek();
    if (tok.type === type) {
      return this.advance();
    }
    throw new Error(`${message} à la ligne ${tok.line}, colonne ${tok.col}`);
  }

  public parse(): any {
    // Skip optional comments or random code at the beginning
    // If the format starts with variable assignments like `questions = [ ... ]`
    // we skip until we find the actual list or dict
    while (
      this.peek().type === 'IDENTIFIER' &&
      this.tokens[this.current + 1]?.type === 'EQUALS'
    ) {
      this.advance(); // consume variable name
      this.advance(); // consume '='
    }

    const value = this.parseValue();
    return value;
  }

  private parseValue(): any {
    const tok = this.peek();
    if (tok.type === 'LBRACK') {
      return this.parseList();
    } else if (tok.type === 'LBRACE') {
      return this.parseDict();
    } else if (tok.type === 'STRING') {
      return this.advance().value;
    } else if (tok.type === 'NUMBER') {
      return parseFloat(this.advance().value);
    } else if (tok.type === 'IDENTIFIER') {
      const val = this.advance().value;
      if (val === 'True') return true;
      if (val === 'False') return false;
      if (val === 'None') return null;
      throw new Error(`Identifiant inattendu '${val}' à la ligne ${tok.line}, colonne ${tok.col}. Les identifiants supportés sont True, False, None.`);
    } else {
      throw new Error(`Valeur attendue (crochet '[', accolade '{', chaîne de caractères ou nombre) à la ligne ${tok.line}, colonne ${tok.col}`);
    }
  }

  private parseList(): any[] {
    this.consume('LBRACK', "Crochet ouvrant '[' attendu");
    const list: any[] = [];

    if (this.peek().type === 'RBRACK') {
      this.advance();
      return list;
    }

    list.push(this.parseValue());
    while (this.match('COMMA')) {
      if (this.peek().type === 'RBRACK') {
        break; // Trailing comma allowed
      }
      list.push(this.parseValue());
    }

    this.consume('RBRACK', "Crochet fermant ']' attendu");
    return list;
  }

  private parseDict(): Record<string, any> {
    this.consume('LBRACE', "Accolade ouvrante '{' attendue");
    const dict: Record<string, any> = {};

    if (this.peek().type === 'RBRACE') {
      this.advance();
      return dict;
    }

    this.parseKeyValuePair(dict);
    while (this.match('COMMA')) {
      if (this.peek().type === 'RBRACE') {
        break; // Trailing comma allowed
      }
      this.parseKeyValuePair(dict);
    }

    this.consume('RBRACE', "Accolade fermante '}' attendue");
    return dict;
  }

  private parseKeyValuePair(dict: Record<string, any>) {
    const keyTok = this.peek();
    let key: string;
    if (keyTok.type === 'STRING') {
      key = this.advance().value;
    } else if (keyTok.type === 'IDENTIFIER') {
      key = this.advance().value;
    } else {
      throw new Error(`Clé de dictionnaire attendue (chaîne ou identifiant simple) à la ligne ${keyTok.line}, colonne ${keyTok.col}`);
    }

    this.consume('COLON', "Deux-points ':' attendu après la clé de dictionnaire");
    const val = this.parseValue();
    dict[key] = val;
  }
}

export function parsePythonQuestions(code: string): { questions: Question[]; errors: string[] } {
  const errors: string[] = [];
  const questions: Question[] = [];

  if (!code || code.trim() === '') {
    return { questions, errors: ["Le code Python est vide."] };
  }

  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const parsedData = parser.parse();

    if (!parsedData) {
      return { questions, errors: ["Impossible de trouver des données exploitables dans le code fourni. Veuillez fournir une liste ou un dictionnaire."] };
    }

    // Normalized to array if it is a single dict object
    const rawList = Array.isArray(parsedData) ? parsedData : [parsedData];

    if (rawList.length === 0) {
      return { questions, errors: ["La liste de questions est vide."] };
    }

    rawList.forEach((item, index) => {
      const qIndexStr = `Question #${index + 1}`;

      if (typeof item !== 'object' || item === null) {
        errors.push(`${qIndexStr} : Doit être un dictionnaire Python (ex: {...})`);
        return;
      }

      // Check for 'question'
      if (!('question' in item) || typeof item.question !== 'string' || item.question.trim() === '') {
        errors.push(`${qIndexStr} : Le champ obligatoire 'question' (string) est absent ou vide.`);
        return;
      }

      // Detect / validate 'type'
      let type: QuestionType = 'QCU';
      if ('type' in item) {
        const rawType = String(item.type).toUpperCase();
        const validTypes: QuestionType[] = ['QCU', 'QCM', 'OPEN', 'DEFINITION', 'CASE_STUDY', 'ANALYSIS'];
        if (validTypes.includes(rawType as QuestionType)) {
          type = rawType as QuestionType;
        } else {
          errors.push(`${qIndexStr} : Type de question '${item.type}' non valide. Les types acceptés sont 'QCU', 'QCM', 'OPEN', 'DEFINITION', 'CASE_STUDY', 'ANALYSIS'.`);
          return;
        }
      } else {
        // Guess type
        if ('options' in item) {
          type = 'QCU'; // Will check correct below to refine to QCM
        } else {
          type = 'OPEN';
        }
      }

      const qId = typeof item.id === 'number' ? item.id : index + 1;
      const category = typeof item.category === 'string' && item.category.trim() !== '' ? item.category.trim() : 'Général';

      // Type-specific validations
      if (type === 'QCU' || type === 'QCM') {
        // Validate options
        if (!('options' in item) || !Array.isArray(item.options)) {
          errors.push(`${qIndexStr} : Le champ obligatoire 'options' doit être une liste de chaînes pour un type ${type}.`);
          return;
        }
        if (item.options.length < 2) {
          errors.push(`${qIndexStr} : Il doit y avoir au moins 2 options pour un type ${type}.`);
          return;
        }
        const allStrOptions = item.options.every((opt: any) => typeof opt === 'string');
        if (!allStrOptions) {
          errors.push(`${qIndexStr} : Toutes les options doivent être des chaînes de caractères.`);
          return;
        }

        // Validate correct
        if (!('correct' in item)) {
          errors.push(`${qIndexStr} : Le champ obligatoire 'correct' est absent pour un type ${type}.`);
          return;
        }

        let correctArray: number[] = [];
        if (typeof item.correct === 'number') {
          correctArray = [item.correct];
        } else if (Array.isArray(item.correct)) {
          correctArray = item.correct.map(Number);
        } else {
          errors.push(`${qIndexStr} : Le champ 'correct' doit être un entier ou une liste d'entiers.`);
          return;
        }

        if (correctArray.length === 0) {
          errors.push(`${qIndexStr} : Le champ 'correct' ne peut pas être vide.`);
          return;
        }

        const invalidIndices = correctArray.filter(
          (val) => isNaN(val) || val < 0 || val >= item.options.length
        );
        if (invalidIndices.length > 0) {
          errors.push(`${qIndexStr} : Les index de réponses correctes [${invalidIndices.join(', ')}] sont hors limites. Les index autorisés vont de 0 à ${item.options.length - 1}.`);
          return;
        }

        // Adjust guessed/configured type based on correctness count
        if (type === 'QCU' && correctArray.length > 1) {
          type = 'QCM'; // Auto-upgrade to QCM if multiple answers are correct
        }

        // Check single correctness for QCU
        if (type === 'QCU' && correctArray.length > 1) {
          errors.push(`${qIndexStr} : Une question à choix unique (QCU) ne peut pas avoir plusieurs réponses correctes.`);
          return;
        }

        questions.push({
          id: qId,
          type,
          question: item.question,
          options: item.options,
          correct: correctArray,
          category,
        });

      } else if (type === 'OPEN' || type === 'DEFINITION' || type === 'ANALYSIS') {
        // Validate expected_answer
        if (!('expected_answer' in item) || typeof item.expected_answer !== 'string' || item.expected_answer.trim() === '') {
          errors.push(`${qIndexStr} : Le champ obligatoire 'expected_answer' (string) est absent ou vide pour un type ${type}.`);
          return;
        }

        questions.push({
          id: qId,
          type,
          question: item.question,
          expected_answer: item.expected_answer,
          category,
        });

      } else if (type === 'CASE_STUDY') {
        // Validate scenario
        if (!('scenario' in item) || typeof item.scenario !== 'string' || item.scenario.trim() === '') {
          errors.push(`${qIndexStr} : Le champ obligatoire 'scenario' (string) est absent ou vide pour un type CASE_STUDY.`);
          return;
        }

        // Validate expected_answer
        if (!('expected_answer' in item) || typeof item.expected_answer !== 'string' || item.expected_answer.trim() === '') {
          errors.push(`${qIndexStr} : Le champ obligatoire 'expected_answer' (string) est absent ou vide pour un type CASE_STUDY.`);
          return;
        }

        questions.push({
          id: qId,
          type,
          question: item.question,
          scenario: item.scenario,
          expected_answer: item.expected_answer,
          category,
        });
      }
    });


  } catch (err: any) {
    errors.push(`Erreur de syntaxe Python : ${err.message}`);
  }

  return { questions, errors };
}
