/**
 * Registry — maps DxConfig.stack to a RuntimeAdapter instance.
 *
 * Keys MUST exactly equal the four PDF-named stacks. The keys-set test is
 * the structural defense against silently dropping a stack: if someone adds
 * a fifth, the test forces them to update the PDF mapping (deliberate
 * decision). If someone removes one, the test fails (PDF stack missing).
 *
 * `resolve()` returns an instance even for stub stacks — only method calls
 * on stubs fail (NotImplementedError). `resolve()` itself only fails for
 * stacks that are not in the registry at all (UnsupportedStackError, with
 * an InnerSource hint).
 */
import type { RuntimeAdapter } from "./runtime-adapter";
/**
 * The registry is exported as a plain object so it survives CommonJS interop
 * (validation_commands does `require('./dist/adapters/registry').registry`).
 */
export declare const registry: Readonly<Record<string, () => RuntimeAdapter>>;
export declare function resolve(stack: string): RuntimeAdapter;
