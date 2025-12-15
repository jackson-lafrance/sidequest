import { useState, useCallback } from 'react';
import { config } from './config';
import { QuestType, SidequestType, createSidequest, addSidequestToQuest, getSidequestsByQuestId, createQuest, updateQuestDetails, deleteAllSidequestsForQuest } from './useFirebase';
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
  title: string;
  description: string;
  questXp: number;
  sidequests: GeneratedSidequest[];
}

export interface AIQuestResponse {
  needsMoreInfo: boolean;
  question?: string;
  questPlan?: GeneratedQuestPlan;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateQuestResult {
  quest: QuestType;
  sidequests: SidequestType[];
}

export interface UsePromptReturn {
  prompt: (message: string, options?: PromptOptions) => Promise<string>;
  chat: (messages: Message[], options?: PromptOptions) => Promise<string>;
  generateSidequests: (quest: QuestType) => Promise<SidequestType[]>;
  generateQuestWithAI: (userId: string, title: string, description: string) => Promise<GenerateQuestResult>;
  updateQuestWithAI: (quest: QuestType, sidequests: SidequestType[], userRequest: string) => Promise<GenerateQuestResult>;
  startQuestConversation: (title: string, description: string) => Promise<AIQuestResponse>;
  continueQuestConversation: (conversationHistory: ConversationMessage[], userResponse: string) => Promise<AIQuestResponse>;
  finalizeQuest: (userId: string, questPlan: GeneratedQuestPlan) => Promise<GenerateQuestResult>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SIDEQUEST_SYSTEM_PROMPT = `You are a task planner for SideQuest, a productivity app. Your job: clean up the user's quest title/description, break it into clear steps, and assign XP rewards.

## Your Tasks
1. **Clean Up the Quest** - Make the title and description clear and specific. Use simple, plain language. No embellishment.
2. **Break it Down** - Create actionable sidequests that fully complete the quest when done.
3. **Assign XP** - Reward effort appropriately.

## Quest Title & Description Guidelines
- Title: Simple, clear, specific. No embellishment or fantasy language. Just plain English. (e.g., "Build a Portfolio Website" not "Launch Your Epic Portfolio" or "Conquer the Web")
- Description: 1-2 simple sentences describing what needs to be done. Plain, straightforward language. No marketing speak or dramatic flair. (e.g., "Create a personal website to show work samples" NOT "A stunning showcase to captivate potential employers")

## SMART Sidequests (CRITICAL)
Every sidequest MUST follow SMART criteria with a clear definition of done:

**S - Specific**: Exactly what needs to be done. Not "work on the design" but "create wireframes for 3 main screens"
**M - Measurable**: How do you know it's done? Include concrete deliverables or quantities.
**A - Achievable**: Can be completed in a single work session or a few days max.
**R - Relevant**: Directly contributes to completing the quest.
**T - Time-bound**: Implicitly completable - not open-ended "ongoing" tasks.

### Sidequest Title Rules
- Start with a strong action verb (Create, Write, Build, Send, Complete, Set up, Research, Draft, Design, Implement)
- Include the specific output/deliverable
- GOOD: "Write 500-word project proposal", "Create login page with email/password fields", "Send intro emails to 5 potential mentors"
- BAD: "Work on proposal", "Design login", "Reach out to people"

### Sidequest Description Rules  
- State the specific deliverable or completion criteria
- Include quantities, specifications, or acceptance criteria when possible
- The user should be able to clearly answer "Is this done? Yes or No"
- GOOD: "Draft a 500-word proposal document covering project goals, timeline, and budget. Save as PDF."
- BAD: "Write up some thoughts about the project"

## Core Principles
1. **Completeness** - When all sidequests are done, the quest IS done. No gaps.
2. **Actionable** - Every sidequest starts with a verb. User knows exactly what to do.
3. **Atomic** - Each sidequest = one clear action. Not "Set up and configure" → split them.
4. **Sequential** - Sidequests MUST be ordered so they can be done one after another. Each sidequest should be completable only after the previous one is done. No parallel tasks or jumping ahead.
5. **Verifiable** - Each sidequest has a clear "done" state that's obvious.
6. **Final Sidequest = Quest Complete** - The LAST sidequest must be the finishing action that truly completes the quest goal. After this step, the user should have achieved their objective. Examples: "Deploy to production", "Submit final report", "Publish the post", "Send the deliverable".

## Sequential Ordering (CRITICAL)
Sidequests are completed ONE AT A TIME in order. The user cannot skip ahead or do them in parallel.
- Order sidequests by logical dependency: what must happen first?
- Earlier sidequests should produce outputs that later sidequests need
- Think of it like a recipe: you can't frost a cake before baking it
- Example flow: Research → Plan → Build → Test → Deploy (not random order)
- BAD: "Deploy site" before "Build the pages"
- GOOD: "Research competitors" → "Draft wireframes" → "Build homepage" → "Deploy to hosting"

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

## Output Format
Respond with ONLY a raw JSON object. No markdown, no backticks, no explanation.

Schema: {"title": string, "description": string, "questXp": number, "sidequests": [{"title": string, "description": string, "xp": number}, ...]}

Example:
{"title":"Build Portfolio Website","description":"Create a personal website to display work samples and contact info.","questXp":400,"sidequests":[{"title":"Sketch wireframes for 4 pages (Home, About, Projects, Contact)","description":"Draw rough layouts on paper or in Figma. Each page should show header, main content area, and footer placement.","xp":100},{"title":"Set up Next.js project with Tailwind CSS","description":"Initialize project using create-next-app, install Tailwind, verify it runs locally at localhost:3000.","xp":150},{"title":"Build and style all 4 pages with placeholder content","description":"Create the 4 pages matching wireframes. Use placeholder text and images. All navigation links should work.","xp":200},{"title":"Deploy to Vercel and verify live URL works","description":"Connect GitHub repo to Vercel, deploy, and confirm the site loads at the public URL on both desktop and mobile.","xp":150}]}`

const CONVERSATIONAL_QUEST_PROMPT = `You are a task planner for SideQuest, a productivity app. The user wants to create a quest (a goal with steps to complete it).

## Your Role
First, decide if you have enough information to create a good quest with clear, actionable sidequests. If you're unsure about scope, timeline, specific requirements, or anything that would help you create better sidequests, ask ONE clarifying question.

## When to Ask for More Info
Ask if:
- The goal is vague (e.g., "learn programming" - what language? what's the goal?)
- The scope is unclear (e.g., "build an app" - what kind? how complex?)
- Timeline would help determine sidequest granularity
- You need specifics to create actionable steps

Don't ask if:
- The goal is already clear and specific
- You can make reasonable assumptions
- More info wouldn't meaningfully improve the sidequests

## Response Format
Respond with ONLY a raw JSON object. No markdown, no backticks.

If you need more info:
{"needsMoreInfo": true, "question": "Your single clarifying question here"}

If you have enough info to create the quest:
{"needsMoreInfo": false, "questPlan": {"title": "...", "description": "...", "questXp": number, "sidequests": [{"title": "...", "description": "...", "xp": number}, ...]}}

## Quest Guidelines (when creating)
- Title: Simple, clear, specific. Plain English.
- Description: 1-2 sentences describing what needs to be done.
- XP: 50-500 per sidequest based on effort. Quest bonus XP: 100-2500 based on total scope.

## SMART Sidequests (CRITICAL)
Every sidequest MUST be SMART with clear completion criteria:
- **Specific**: Exactly what to do, not vague. Include deliverables.
- **Measurable**: Quantities, specifications, or clear "done" criteria.
- **Achievable**: Completable in one session or a few days.
- **Relevant**: Directly advances the quest.
- **Time-bound**: Not open-ended.

Sidequest titles: Start with action verb + specific output (e.g., "Write 500-word proposal", "Create 3 wireframe sketches", "Send 5 outreach emails")
Sidequest descriptions: State exactly what "done" looks like. User should easily answer "Is this complete? Yes/No"

## Sequential Ordering
Sidequests are done ONE AT A TIME in order. Order them by dependency - what must happen first? Think like a recipe: can't frost before baking.

## Final Sidequest (CRITICAL)
The LAST sidequest MUST be the finishing action that truly completes the quest goal. After this step, the user should have achieved their objective. Examples: "Deploy to production", "Submit final report", "Publish the post", "Send the deliverable to client". The quest is auto-completed when this final sidequest is done.`

const UPDATE_QUEST_SYSTEM_PROMPT = `You are a task planner for SideQuest, a productivity app. The user has an existing quest and wants to modify it based on their request.

## Your Task
Take the existing quest and sidequests, apply the user's requested changes, and output an updated version.

## Guidelines
- Apply the user's changes as requested
- Keep sidequests that are still relevant, modify or remove ones that aren't
- Add new sidequests if needed based on the changes
- Adjust XP values if the scope changes significantly
- Use simple, plain language. No embellishment or fantasy language.

## SMART Sidequests (CRITICAL)
Every sidequest MUST be SMART with clear completion criteria:
- **Specific**: Exactly what to do with concrete deliverables (not "work on X" but "create X with Y specifications")
- **Measurable**: Include quantities, specs, or clear "done" criteria
- **Achievable**: Completable in one session or a few days
- **Relevant**: Directly advances the quest
- **Time-bound**: Not open-ended ongoing tasks

Sidequest titles: Action verb + specific output (e.g., "Write 500-word proposal", "Create 3 wireframes", "Send 5 emails")
Sidequest descriptions: State exactly what "done" looks like. User should easily answer "Is this complete? Yes/No"

## Sequential Ordering
Sidequests are done ONE AT A TIME in order. Order them by dependency - what must happen first? Earlier sidequests produce outputs needed by later ones.

## Final Sidequest (CRITICAL)
The LAST sidequest MUST be the finishing action that truly completes the quest goal. After this step, the user has achieved their objective. Examples: "Deploy to production", "Submit final report", "Publish the post", "Send deliverable to client".

## Important Rules
- If the user asks to add something, add it
- If the user asks to remove something, remove it
- If the user asks to change scope, adjust sidequests accordingly
- Keep the same general structure unless the user asks for a complete overhaul

## Output Format
Respond with ONLY a raw JSON object. No markdown, no backticks, no explanation.

Schema: {"title": string, "description": string, "questXp": number, "sidequests": [{"title": string, "description": string, "xp": number}, ...]}`;


export default function usePrompt(): UsePromptReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const chat = useCallback(async (
    messages: Message[],
    options?: PromptOptions
  ): Promise<string> => {
    const apiKey = config.openai.apiKey;

    if (!apiKey) {
      const errorMsg = 'OpenAI API key is not configured';
      setError(errorMsg);
      throw new Error(errorMsg);
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
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from AI');
      }

      return content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const prompt = useCallback(async (
    message: string,
    options?: PromptOptions
  ): Promise<string> => {
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
  }, [chat]);

  const generateQuestWithAI = useCallback(async (
    userId: string,
    title: string,
    description: string
  ): Promise<GenerateQuestResult> => {
    const userPrompt = `Improve and break down the following quest:

User's Quest Title: ${title || 'No title provided'}
User's Quest Description: ${description || 'No description provided'}

1. Create an improved, engaging title and description
2. Determine the quest completion XP bonus
3. Break it into actionable sidequests

Output ONLY valid JSON. No markdown, no code blocks.`;

    const messages: Message[] = [
      { role: 'system', content: SIDEQUEST_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const response = await chat(messages, {
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
    });

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

    if (!questPlan.title || !questPlan.description || typeof questPlan.questXp !== 'number' || !Array.isArray(questPlan.sidequests)) {
      throw new Error('AI response missing required fields');
    }

    // Create the quest with AI-improved title, description, and XP
    const questId = Crypto.randomUUID();
    const quest = await createQuest(userId, questPlan.title, questPlan.description, questPlan.questXp, questId);

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
  }, [chat]);

  const updateQuestWithAI = useCallback(async (
    quest: QuestType,
    sidequests: SidequestType[],
    userRequest: string
  ): Promise<GenerateQuestResult> => {
    const sortedSidequests = [...sidequests].sort((a, b) => a.orderIndex - b.orderIndex);
    
    const sidequestsInfo = sortedSidequests.map((sq, i) => 
      `${i + 1}. "${sq.title}" - ${sq.description} (${sq.totalSidequestXp} XP)${sq.isCompleted ? ' [COMPLETED]' : ''}`
    ).join('\n');

    const userPrompt = `Here is the current quest:

Quest Title: ${quest.title}
Quest Description: ${quest.description}
Quest Completion XP: ${quest.totalQuestXp}

Current Sidequests:
${sidequestsInfo || 'No sidequests yet'}

User's requested change: "${userRequest}"

Apply the user's changes and output the updated quest. Output ONLY valid JSON. No markdown, no code blocks.`;

    const messages: Message[] = [
      { role: 'system', content: UPDATE_QUEST_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const response = await chat(messages, {
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
    });

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

    if (!questPlan.title || !questPlan.description || typeof questPlan.questXp !== 'number' || !Array.isArray(questPlan.sidequests)) {
      throw new Error('AI response missing required fields');
    }

    // Delete all existing sidequests
    await deleteAllSidequestsForQuest(quest.id);

    // Update the quest details
    const updatedQuest = await updateQuestDetails(quest.id, questPlan.title, questPlan.description, questPlan.questXp);
    
    if (!updatedQuest) {
      throw new Error('Failed to update quest');
    }

    // Create all new sidequests
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

    return { quest: updatedQuest, sidequests: createdSidequests };
  }, [chat]);

  const startQuestConversation = useCallback(async (
    title: string,
    description: string
  ): Promise<AIQuestResponse> => {
    const userPrompt = `I want to create a quest:

Title: ${title || 'Not provided'}
Description: ${description || 'Not provided'}

Decide if you need more information to create good sidequests, or if you can proceed.`;

    const messages: Message[] = [
      { role: 'system', content: CONVERSATIONAL_QUEST_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    const response = await chat(messages, {
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
    });

    try {
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanedResponse) as AIQuestResponse;
      return parsed;
    } catch {
      throw new Error('Failed to parse AI response');
    }
  }, [chat]);

  const continueQuestConversation = useCallback(async (
    conversationHistory: ConversationMessage[],
    userResponse: string
  ): Promise<AIQuestResponse> => {
    const messages: Message[] = [
      { role: 'system', content: CONVERSATIONAL_QUEST_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userResponse },
    ];

    const response = await chat(messages, {
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
    });

    try {
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanedResponse) as AIQuestResponse;
      return parsed;
    } catch {
      throw new Error('Failed to parse AI response');
    }
  }, [chat]);

  const finalizeQuest = useCallback(async (
    userId: string,
    questPlan: GeneratedQuestPlan
  ): Promise<GenerateQuestResult> => {
    const questId = Crypto.randomUUID();
    const quest = await createQuest(userId, questPlan.title, questPlan.description, questPlan.questXp, questId);

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
  }, []);

  return {
    prompt,
    chat,
    generateSidequests,
    generateQuestWithAI,
    updateQuestWithAI,
    startQuestConversation,
    continueQuestConversation,
    finalizeQuest,
    loading,
    error,
    clearError,
  };
}

