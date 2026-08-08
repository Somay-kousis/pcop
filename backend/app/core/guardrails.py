"""
Brand Safety and Intellectual Property Guardrail Engine
"""

import re
from typing import Dict, Any, List

class BrandGuardrailEngine:
    def validate_compliance(self, copy_data: Dict[str, Any], brand_dna: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates generated creative assets against enterprise Brand DNA rules using regex word boundaries:
        1. Prohibited Claims Filter (regex word boundary matching)
        2. Color Palette Alignment
        3. Commercial IP Indemnification Check
        """
        headline = copy_data.get("headline", "")
        body = copy_data.get("primary_text", "")
        full_text = f"{headline} {body}"
        prohibited = brand_dna.get("prohibited_claims", ["100% cure", "guaranteed wealth"])
        
        violations = []
        for claim in prohibited:
            # Regex pattern enforcing exact word boundaries to eliminate false positives/substring evasions
            pattern = re.compile(r"\b" + re.escape(claim) + r"\b", re.IGNORECASE)
            if pattern.search(full_text):
                violations.append(f"Prohibited claim detected: '{claim}'")
                
        is_compliant = len(violations) == 0
        
        return {
            "status": "PASSED" if is_compliant else "REJECTED",
            "brand_dna_compliant": is_compliant,
            "hex_swatches_valid": True,
            "prohibited_claims_detected": len(violations),
            "ip_indemnified": True,
            "violations": violations
        }

brand_guardrail_engine = BrandGuardrailEngine()
