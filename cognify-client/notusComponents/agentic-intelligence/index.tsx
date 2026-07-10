"use client";
import { Container } from "../container";
import { Badge } from "../badge";
import { SubHeading } from "../subheading";
import { SectionHeading } from "../seciton-heading";
import { Card, CardDescription, CardTitle } from "./card";
import {
  BrainIcon,
  FingerprintIcon,
  MouseBoxIcon,
  NativeIcon,
  RealtimeSyncIcon,
  SDKIcon,
} from "../../landingSettings/icons/bento-icons";
import {
  LLMModelSelectorSkeleton,
  NativeToolsIntegrationSkeleton,
  TextToWorkflowBuilderSkeleton,
} from "./skeletons";

export const AgenticIntelligence = () => {
  return (
    <Container className="border-divide border-x">
      <div className="flex flex-col items-center py-16">
        <Badge text="Features" />
        <SectionHeading className="mt-4">
          Built for Agentic Intelligence
        </SectionHeading>

        <SubHeading as="p" className="mx-auto mt-6 max-w-lg px-2">
          Build, test and deploy AI agents with a powerful visual interface
          designed for technical teams
        </SubHeading>
        <div className="border-divide divide-divide mt-16 grid grid-cols-1 divide-y border-y md:grid-cols-2 md:divide-x">
          <Card className="overflow-hidden mask-b-from-80%">
            <div className="flex items-center gap-2">
              <BrainIcon className="text-brand size-6" />
              <CardTitle>Multi-Model Orchestration</CardTitle>
            </div>
            <CardDescription>
              Select the best model for each agent. Cognify routes prompts to Claude, Llama, and other top LLMs dynamically.
            </CardDescription>
            <LLMModelSelectorSkeleton />
          </Card>
          <Card className="overflow-hidden mask-b-from-80%">
            <div className="flex items-center gap-2">
              <MouseBoxIcon className="text-brand size-6" />
              <CardTitle>Visual Agentic Workflows</CardTitle>
            </div>
            <CardDescription>
              Orchestrate complex tasks with specialized AI agents, custom prompt templates, and visual tool routing.
            </CardDescription>
            <TextToWorkflowBuilderSkeleton />
          </Card>
        </div>
        <div className="w-full">
          <Card className="relative w-full max-w-none overflow-hidden">
            <div className="pointer-events-none absolute inset-0 h-full w-full bg-[radial-gradient(var(--color-dots)_1px,transparent_1px)] mask-radial-from-10% [background-size:10px_10px]"></div>
            <div className="flex items-center gap-2">
              <NativeIcon className="text-brand size-6" />
              <CardTitle>Enterprise-Grade Security</CardTitle>
            </div>
            <CardDescription>
              Cognify runs secure execution sandboxes. All conversations and memories are private to your account and isolated per workspace.
            </CardDescription>
            <NativeToolsIntegrationSkeleton />
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-2">
              <FingerprintIcon className="text-brand size-6" />
              <CardTitle>One Click Auth</CardTitle>
            </div>
            <CardDescription>
              A drag-and-drop interface to create, connect, and configure agents
              into logical workflows
            </CardDescription>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <RealtimeSyncIcon className="text-brand size-6" />
              <CardTitle>Realtime Sync</CardTitle>
            </div>
            <CardDescription>
              Agents operate independently and coordinate tasks to complete
              complex all goals
            </CardDescription>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <SDKIcon className="text-brand size-6" />
              <CardTitle>Custom Connector SDK</CardTitle>
            </div>
            <CardDescription>
              Run agent workflows in a sandbox to preview behavior, debug logic,
              and test interactions
            </CardDescription>
          </Card>
        </div>
      </div>
    </Container>
  );
};
