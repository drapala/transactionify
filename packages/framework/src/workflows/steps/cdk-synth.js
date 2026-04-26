"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sandboxVerifyStep = exports.cdkSynthStep = void 0;
function cdkSynthStep() {
    return {
        name: "cdk synth",
        run: "npx tsc && npx cdk synth --quiet",
    };
}
exports.cdkSynthStep = cdkSynthStep;
function sandboxVerifyStep() {
    return {
        name: "sandbox verify (synth-only at PoC fidelity)",
        run: [
            "# Synth against a stub sandbox account/region. NO AWS credentials configured at PoC",
            "# fidelity — real cloud deploy is the ADR Future Integrations evolution path",
            "# (requires OIDC + sandbox AWS account, ~1d of plumbing).",
            "npx tsc",
            "npx cdk synth --context account=000000000000 --context region=us-east-1 --quiet",
            "test -d cdk.out",
            "find cdk.out -maxdepth 1 -name '*.template.json' -print -quit | grep -q . || { echo 'no synthesised templates in cdk.out/'; exit 1; }",
        ].join("\n"),
    };
}
exports.sandboxVerifyStep = sandboxVerifyStep;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN5bnRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN5bnRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLFNBQWdCLFlBQVk7SUFDMUIsT0FBTztRQUNMLElBQUksRUFBRSxXQUFXO1FBQ2pCLEdBQUcsRUFBRSxrQ0FBa0M7S0FDeEMsQ0FBQztBQUNKLENBQUM7QUFMRCxvQ0FLQztBQUVELFNBQWdCLGlCQUFpQjtJQUMvQixPQUFPO1FBQ0wsSUFBSSxFQUFFLDZDQUE2QztRQUNuRCxHQUFHLEVBQUU7WUFDSCxxRkFBcUY7WUFDckYsOEVBQThFO1lBQzlFLDJEQUEyRDtZQUMzRCxTQUFTO1lBQ1QsaUZBQWlGO1lBQ2pGLGlCQUFpQjtZQUNqQix1SUFBdUk7U0FDeEksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ2IsQ0FBQztBQUNKLENBQUM7QUFiRCw4Q0FhQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgV29ya2Zsb3dTdGVwIH0gZnJvbSBcIi4uL3JlbmRlcmVyXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjZGtTeW50aFN0ZXAoKTogV29ya2Zsb3dTdGVwIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcImNkayBzeW50aFwiLFxuICAgIHJ1bjogXCJucHggdHNjICYmIG5weCBjZGsgc3ludGggLS1xdWlldFwiLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuZGJveFZlcmlmeVN0ZXAoKTogV29ya2Zsb3dTdGVwIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInNhbmRib3ggdmVyaWZ5IChzeW50aC1vbmx5IGF0IFBvQyBmaWRlbGl0eSlcIixcbiAgICBydW46IFtcbiAgICAgIFwiIyBTeW50aCBhZ2FpbnN0IGEgc3R1YiBzYW5kYm94IGFjY291bnQvcmVnaW9uLiBOTyBBV1MgY3JlZGVudGlhbHMgY29uZmlndXJlZCBhdCBQb0NcIixcbiAgICAgIFwiIyBmaWRlbGl0eSDigJQgcmVhbCBjbG91ZCBkZXBsb3kgaXMgdGhlIEFEUiBGdXR1cmUgSW50ZWdyYXRpb25zIGV2b2x1dGlvbiBwYXRoXCIsXG4gICAgICBcIiMgKHJlcXVpcmVzIE9JREMgKyBzYW5kYm94IEFXUyBhY2NvdW50LCB+MWQgb2YgcGx1bWJpbmcpLlwiLFxuICAgICAgXCJucHggdHNjXCIsXG4gICAgICBcIm5weCBjZGsgc3ludGggLS1jb250ZXh0IGFjY291bnQ9MDAwMDAwMDAwMDAwIC0tY29udGV4dCByZWdpb249dXMtZWFzdC0xIC0tcXVpZXRcIixcbiAgICAgIFwidGVzdCAtZCBjZGsub3V0XCIsXG4gICAgICBcImZpbmQgY2RrLm91dCAtbWF4ZGVwdGggMSAtbmFtZSAnKi50ZW1wbGF0ZS5qc29uJyAtcHJpbnQgLXF1aXQgfCBncmVwIC1xIC4gfHwgeyBlY2hvICdubyBzeW50aGVzaXNlZCB0ZW1wbGF0ZXMgaW4gY2RrLm91dC8nOyBleGl0IDE7IH1cIixcbiAgICBdLmpvaW4oXCJcXG5cIiksXG4gIH07XG59XG4iXX0=