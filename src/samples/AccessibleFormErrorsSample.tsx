import { useId, useRef, useState } from "react";

interface ValidationErrors {
  readonly contact: string | null;
  readonly summary: string | null;
}

interface FormValues {
  readonly contact: string;
  readonly summary: string;
}

const validationChecklist = [
  "Each invalid field sets aria-invalid and points aria-describedby at its error text.",
  "The error summary uses role=alert so screen readers announce validation failures immediately.",
  "Submitting focuses the first invalid field so keyboard users land where they need to fix the form.",
  "Helpful guidance remains associated with each field even after errors appear.",
] as const;

function validateForm(values: FormValues): ValidationErrors {
  const contact =
    values.contact.trim().includes("@")
      ? null
      : "Enter a valid contact email so reviewers know where approval replies should go.";

  const summary =
    values.summary.trim().length >= 24
      ? null
      : "Describe the issue in at least 24 characters so the remediation request is meaningful.";

  return {
    contact,
    summary,
  };
}

function hasErrors(errors: ValidationErrors) {
  return Boolean(errors.contact || errors.summary);
}

export default function AccessibleFormErrorsSample() {
  const contactId = useId();
  const summaryId = useId();
  const contactHelpId = useId();
  const summaryHelpId = useId();
  const contactErrorId = useId();
  const summaryErrorId = useId();

  const contactRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  const [values, setValues] = useState<FormValues>({
    contact: "",
    summary: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({
    contact: null,
    summary: null,
  });
  const [submissionMessage, setSubmissionMessage] = useState(
    "Submit the form with missing details first, then correct the fields to see the accessible validation flow.",
  );

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: null,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setSubmissionMessage(
        "Fix the highlighted fields. The first invalid field receives focus and each error is linked semantically to its input.",
      );

      if (nextErrors.contact) {
        contactRef.current?.focus();
        return;
      }

      if (nextErrors.summary) {
        summaryRef.current?.focus();
      }

      return;
    }

    setSubmissionMessage(
      `Submitted the remediation request for ${values.contact.trim()} with a valid summary.`,
    );
  }

  return (
    <div className="accessible-form-errors-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Accessible form errors and validation messaging</h3>
      </div>

      <p className="section-copy">
        This sample covers another common accessibility interview topic: semantic form errors, field guidance,
        keyboard-friendly focus management, and validation messaging that stays understandable to screen readers.
      </p>

      <div className="accessible-form-errors-sample__layout">
        <section className="sample-card accessible-form-errors-sample__panel" aria-label="Accessible validation example">
          <div className="section-heading">
            <p className="eyebrow">Validation flow</p>
            <h4>Remediation request form</h4>
          </div>

          {hasErrors(errors) ? (
            <div className="accessible-form-errors-sample__error-summary" role="alert">
              <strong>Fix the highlighted fields before submitting.</strong>
              <ul className="summary-list">
                {errors.contact ? <li>{errors.contact}</li> : null}
                {errors.summary ? <li>{errors.summary}</li> : null}
              </ul>
            </div>
          ) : null}

          <form className="accessible-form-errors-sample__form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor={contactId}>Contact email</label>
              <input
                ref={contactRef}
                id={contactId}
                type="email"
                value={values.contact}
                aria-invalid={errors.contact ? "true" : undefined}
                aria-describedby={errors.contact ? `${contactHelpId} ${contactErrorId}` : contactHelpId}
                onChange={(event) => updateField("contact", event.target.value)}
                placeholder="reviewer@example.com"
              />
              <p id={contactHelpId} className="accessible-form-errors-sample__help">
                Use the inbox where reviewers will send approval follow-ups.
              </p>
              {errors.contact ? (
                <p id={contactErrorId} className="accessible-form-errors-sample__error">
                  {errors.contact}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor={summaryId}>Issue summary</label>
              <textarea
                ref={summaryRef}
                id={summaryId}
                value={values.summary}
                aria-invalid={errors.summary ? "true" : undefined}
                aria-describedby={errors.summary ? `${summaryHelpId} ${summaryErrorId}` : summaryHelpId}
                onChange={(event) => updateField("summary", event.target.value)}
                placeholder="Describe the recovery risk and the decision that needs approval."
                rows={5}
              />
              <p id={summaryHelpId} className="accessible-form-errors-sample__help">
                Give enough context that a keyboard-only reviewer can understand the request without hunting elsewhere.
              </p>
              {errors.summary ? (
                <p id={summaryErrorId} className="accessible-form-errors-sample__error">
                  {errors.summary}
                </p>
              ) : null}
            </div>

            <button type="submit" className="primary-button">
              Submit remediation request
            </button>
          </form>

          <p className="accessible-form-errors-sample__status">{submissionMessage}</p>
        </section>

        <section className="sample-card accessible-form-errors-sample__panel" aria-label="Validation checklist">
          <div className="section-heading">
            <p className="eyebrow">Interview angle</p>
            <h4>What to verify</h4>
          </div>

          <ul className="summary-list accessible-form-errors-sample__checklist">
            {validationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}