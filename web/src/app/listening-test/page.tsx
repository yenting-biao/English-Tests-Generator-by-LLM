"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ListeningPage() {
  const [url, setUrl] = useState<string>("");
  const [transcription, setTranscription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/listening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });
      if (response.ok) {
        alert("Transcription successful");
        const data = await response.json();
        const transcription = data.transcription;
        setTranscription(transcription);
      } else {
        alert("Transcription failed");
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-4">
      <h1>Listening Test</h1>
      <Input value={url} onChange={(e) => setUrl(e.target.value)} />
      <Button onClick={handleSubmit} disabled={loading}>
        Submit
      </Button>
      <div>
        <h2>Transcription</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
}
