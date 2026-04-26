/**
 * PythonAdapter — the real adapter dogfooded against the Transactionify fork.
 *
 * lint:     ruff check .
 * unit:     pytest -x -q -m 'not pbt'   (cwd from .dx.yaml.test_root)
 * pbt:      pytest -x -q -m pbt          (cwd from .dx.yaml.test_root)
 * contract: schemathesis run openapi.yaml --hypothesis-deadline=2000
 * package:  service_shape-aware
 *             - lambda → cdk synth + tar cdk.out
 *             - wheel  → uv build
 *             - unset & ambiguous → AdapterConfigError
 *
 * test_root defaults by service_shape:
 *   - lambda → 'test/unit/src/python' (Transactionify-style)
 *   - wheel  → 'tests'                (distributable Python)
 * Override via .dx.yaml.test_root when the project deviates.
 */
import type { DxConfig } from "../types/dx-config";
import type { AdapterCommand, RuntimeAdapter } from "./runtime-adapter";
export declare class PythonAdapter implements RuntimeAdapter {
    readonly stack: "python";
    lintCommand(_config: DxConfig): AdapterCommand;
    unitTestCommand(config: DxConfig): AdapterCommand;
    pbtCommand(config: DxConfig): AdapterCommand;
    contractCommand(_config: DxConfig): AdapterCommand;
    packageCommand(config: DxConfig): AdapterCommand;
}
