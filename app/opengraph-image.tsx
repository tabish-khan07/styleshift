import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'StyleShift — Precision AI Text Style Rewriter';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
          padding: '40px',
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '30%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          <span>✨ Powered by Google Gemini 2.5 Flash</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #ffffff, #e2e8f0, #c084fc)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '16px',
          }}
        >
          StyleShift AI Studio
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            maxWidth: '800px',
            textAlign: 'center',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Transform text into any voice with parallel multi-style rewrites, live semantic preservation scores, and word-level diffs.
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '16px',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            ✓ Meaning Preservation Scoring
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '16px',
              color: '#fbbf24',
              fontWeight: 600,
            }}
          >
            ⚡ Parallel Gemini Execution
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '16px',
              color: '#c084fc',
              fontWeight: 600,
            }}
          >
            🎙️ Adaptive Voice Profiling
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
