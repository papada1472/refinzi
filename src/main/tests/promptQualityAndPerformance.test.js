import { describe, it, expect } from "vitest";
import { buildEnvelope } from "../output/compiler.js";
import { optimizeEnvelope } from "../output/optimizer.js";
import { buildExecutionPlan } from "../output/promptEngineer.js";
import { ProviderManager } from "../ai/ProviderManager.js";

describe("Prompt Quality & Domain Adaptation", () => {
  it("adapts system prompt for generative media & video inputs", () => {
    const input = "a samurai walking through fog in neon rain with slow camera motion";
    const { envelope } = buildEnvelope({ input, mode: "sparkle" });
    const optimized = optimizeEnvelope(envelope);
    const plan = buildExecutionPlan(optimized, "sparkle");

    expect(plan.systemPrompt).toContain("Cinematographer");
    expect(plan.systemPrompt).toContain("camera choreography");
    expect(plan.systemPrompt).toContain("volumetric lighting");
  });

  it("adapts system prompt for research & academic literature inputs", () => {
    const input = "critique this clinical study methodology for selection bias and confounders";
    const { envelope } = buildEnvelope({ input, mode: "sparkle" });
    const optimized = optimizeEnvelope(envelope);
    const plan = buildExecutionPlan(optimized, "sparkle");

    expect(plan.systemPrompt).toContain("Research Scientist");
    expect(plan.systemPrompt).toContain("methodological critique");
    expect(plan.systemPrompt).toContain("confounders");
  });

  it("adapts system prompt for code & software architecture inputs", () => {
    const input = "build a responsive pricing table in react with tailwind and state toggle";
    const { envelope } = buildEnvelope({ input, mode: "sparkle" });
    const optimized = optimizeEnvelope(envelope);
    const plan = buildExecutionPlan(optimized, "sparkle");

    expect(plan.systemPrompt).toContain("Software Architect");
    expect(plan.systemPrompt).toContain("component boundaries");
  });

  it("expert mode injects deep domain specifications", () => {
    const input = "evaluate literature review comparing transformer attention vs mamba";
    const { envelope } = buildEnvelope({ input, mode: "hold" });
    const optimized = optimizeEnvelope(envelope);
    const plan = buildExecutionPlan(optimized, "expert");

    expect(plan.systemPrompt).toContain("Research Scientist");
    expect(plan.systemPrompt).toContain("adversarial falsification");
  });
});

describe("Performance & In-Memory Transformation Cache", () => {
  it("stores and retrieves cached transformations in < 5ms", () => {
    ProviderManager.clearCache();
    const statsBefore = ProviderManager.getCacheStats();
    expect(statsBefore.size).toBe(0);

    const testInput = "an astronaut walking on mars";
    const testOutput = "Cinematic 35mm low-angle tracking shot of an astronaut on Mars...";
    
    ProviderManager.setInCache("deepseek", "deepseek-chat", "sparkle", "sys", testInput, testOutput);
    
    const retrieved = ProviderManager.getFromCache("deepseek", "deepseek-chat", "sparkle", "sys", testInput);
    expect(retrieved).toBe(testOutput);

    const statsAfter = ProviderManager.getCacheStats();
    expect(statsAfter.size).toBe(1);

    // Clean up
    ProviderManager.clearCache();
    expect(ProviderManager.getCacheStats().size).toBe(0);
  });
});
