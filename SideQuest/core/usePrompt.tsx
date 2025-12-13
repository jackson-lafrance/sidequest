import { useState, useCallback } from 'react';
import { config } from './config';
import { QuestType, SidequestType, createSidequest, addSidequestToQuest, getSidequestsByQuestId, createQuest } from './useFirebase';
import * as Crypto from 'expo-crypto';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PromptOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface GeneratedSidequest {
  title: string;
  description: string;
  xp: number;
}

export interface GeneratedQuestPlan {
  questXp: number;
  sidequests: GeneratedSidequest[];
}

export interface GenerateQuestResult {
  quest: QuestType;
  sidequests: SidequestType[];
}

export interface UsePromptReturn {
  prompt: (message: string, options?: PromptOptions) => Promise<string | null>;
  chat: (messages: Message[], options?: PromptOptions) => Promise<string | null>;
  generateSidequests: (quest: QuestType) => Promise<SidequestType[]>;
  generateQuestWithAI: (userId: string, title: string, description: string) => Promise<GenerateQuestResult>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SIDEQUEST_SYSTEM_PROMPT = `You are a quest designer for SideQuest, a gamified productivity app. Your job: break down a user's main quest into satisfying, completable sidequests, and determine appropriate XP rewards.

## Core Principles
1. **Completeness** - When all sidequests are done, the quest IS done. No gaps.
2. **Actionable** - Every sidequest starts with a verb. User knows exactly what to do.
3. **Atomic** - Each sidequest = one clear action. Not "Set up and configure" → split them.
4. **Progressive** - Order matters. Earlier sidequests unlock or enable later ones.

## Sidequest Count (Based on Quest Complexity)
- Quick win (~1 day): 2-3 sidequests
- Short project (~1 week): 3-5 sidequests
- Medium project (3-6 weeks): 5-7 sidequests
- Large project (3+ months): 7-10 sidequests

## XP Guidelines

### Sidequest XP (Based on Effort)
- 50-100 XP: Quick tasks (few hours) - sending emails, making lists, quick research, simple fixes
- 100-200 XP: Short tasks (1-2 days) - writing drafts, setting up tools, small implementations
- 200-350 XP: Medium tasks (3-5 days) - completing a feature, deep work sessions, substantial progress
- 350-500 XP: Challenging tasks (1+ week) - complex implementations, creative work, difficult problems

### Quest Completion Bonus XP
The questXp is a BONUS awarded when the entire quest is completed. It should be:
- 100-250 XP for quick quests (~1 day)
- 250-500 XP for short projects (~1 week)
- 500-1000 XP for medium projects (3-6 weeks)
- 1000-2500 XP for large projects (3+ months)
Think of it as a reward for seeing the whole thing through.

## Writing Great Sidequests
GOOD titles: "Draft project proposal outline", "Install dependencies and verify setup", "Write unit tests for auth module"
BAD titles: "Research stuff", "Work on project", "Think about design", "Continue working"

GOOD descriptions: Specific, explain the deliverable, 1-2 sentences max
BAD descriptions: Vague, no clear endpoint, just restating the title

## Output Format
Respond with ONLY a raw JSON object. No markdown, no backticks, no explanation.

Schema: {"questXp": number, "sidequests": [{"title": string, "description": string, "xp": number}, ...]}

Example:
{"questXp":400,"sidequests":[{"title":"Create wireframe sketches","description":"Sketch the main screens on paper or whiteboard to visualize the user flow before building.","xp":100},{"title":"Set up React Native project","description":"Initialize the project with Expo, install core dependencies, and verify it runs on simulator.","xp":150},{"title":"Build login screen UI","description":"Implement the login form with email/password fields, submit button, and basic validation feedback.","xp":200}]}`

export default function usePrompt(): UsePromptReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const chat = useCallback(async (
    messages: Message[],
    options?: PromptOptions
  ): Promise<string | null> => {
    const apiKey = config.openai.apiKey;

    if (!apiKey) {
      setError('OpenAI API key is not configured');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model ?? 'gpt-4o-mini',
          messages,
          max_tokens: options?.maxTokens ?? 1024,
          temperature: options?.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message ?? `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? null;

      return content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const prompt = useCallback(async (
    message: string,
    options?: PromptOptions
  ): Promise<string | null> => {
    const messages: Message[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    return chat(messages, options);
  }, [chat]);

  const generateSidequests = useCallback(async (
    quest: QuestType
  ): Promise<SidequestType[]> => {
    const userPrompt = `Break down the following quest into sidequests:

Quest Title: ${quest.title}
Quest Description: ${quest.description}

Decide how many sidequests are needed based on the quest's complexity. Output ONLY valid JSON. No markdown, no code blocks, just the raw JSON.`;

    const messages: Message[] = [
      { role: 'system', content: SIDEQUEST_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const response = await chat(messages, {
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
    });

    if (!response) {
      throw new Error(error ?? 'Failed to generate sidequests');
    }

    let questPlan: GeneratedQuestPlan;
    try {
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      questPlan = JSON.parse(cleanedResponse);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!questPlan.sidequests || !Array.isArray(questPlan.sidequests)) {
      throw new Error('AI response did not contain sidequests array');
    }

    const existingSidequests = await getSidequestsByQuestId(quest.id);
    const startingOrderIndex = existingSidequests.length;

    const createdSidequests: SidequestType[] = [];

    for (let i = 0; i < questPlan.sidequests.length; i++) {
      const generated = questPlan.sidequests[i];
      const orderIndex = startingOrderIndex + i;
      const id = Crypto.randomUUID();

      const sidequest = await createSidequest(
        quest.id,
        generated.title,
        generated.description,
        generated.xp,
        orderIndex,
        id
      );

      await addSidequestToQuest(quest.id, sidequest.id);
      createdSidequests.push(sidequest);
    }

    return createdSidequests;
  }, [chat, error]);

  const generateQuestWithAI = useCallback(async (
    userId: string,
    title: string,
    description: string
  ): Promise<GenerateQuestResult> => {
    const userPrompt = `Break down the following quest into sidequests and determine appropriate XP:

Quest Title: ${title}
Quest Description: ${description}

Analyze the complexity and output a questXp (completion bonus) plus sidequests. Output ONLY valid JSON. No markdown, no code blocks.`;

    const messages: Message[] = [
      { role: 'system', content: SIDEQUEST_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const response = await chat(messages, {
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
    });

    if (!response) {
      throw new Error(error ?? 'Failed to generate quest plan');
    }

    let questPlan: GeneratedQuestPlan;
    try {
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      questPlan = JSON.parse(cleanedResponse);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    if (typeof questPlan.questXp !== 'number' || !Array.isArray(questPlan.sidequests)) {
      throw new Error('AI response missing questXp or sidequests');
    }

    // Create the quest with AI-determined XP
    const questId = Crypto.randomUUID();
    const quest = await createQuest(userId, title, description, questPlan.questXp, questId);

    // Create all sidequests
    const createdSidequests: SidequestType[] = [];

    for (let i = 0; i < questPlan.sidequests.length; i++) {
      const generated = questPlan.sidequests[i];
      const id = Crypto.randomUUID();

      const sidequest = await createSidequest(
        quest.id,
        generated.title,
        generated.description,
        generated.xp,
        i,
        id
      );

      await addSidequestToQuest(quest.id, sidequest.id);
      createdSidequests.push(sidequest);
    }

    return { quest, sidequests: createdSidequests };
  }, [chat, error]);

  return {
    prompt,
    chat,
    generateSidequests,
    generateQuestWithAI,
    loading,
    error,
    clearError,
  };
}

