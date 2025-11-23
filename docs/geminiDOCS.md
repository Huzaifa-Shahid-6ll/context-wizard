<br />

<br />

# Gemini API

The developer platform to build and scale with Google's latest AI models. Start in minutes.  

### Python

    from google import genai

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Explain how AI works in a few words",
    )

    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Explain how AI works in a few words",
      });
      console.log(response.text);
    }

    await main();

### Go

    package main

    import (
        "context"
        "fmt"
        "log"
        "google.golang.org/genai"
    )

    func main() {
        ctx := context.Background()
        client, err := genai.NewClient(ctx, nil)
        if err != nil {
            log.Fatal(err)
        }

        result, err := client.Models.GenerateContent(
            ctx,
            "gemini-2.5-flash",
            genai.Text("Explain how AI works in a few words"),
            nil,
        )
        if err != nil {
            log.Fatal(err)
        }
        fmt.Println(result.Text())
    }

### Java

    package com.example;

    import com.google.genai.Client;
    import com.google.genai.types.GenerateContentResponse;

    public class GenerateTextFromTextInput {
      public static void main(String[] args) {
        Client client = new Client();

        GenerateContentResponse response =
            client.models.generateContent(
                "gemini-2.5-flash",
                "Explain how AI works in a few words",
                null);

        System.out.println(response.text());
      }
    }

### C#

    using System.Threading.Tasks;
    using Google.GenAI;
    using Google.GenAI.Types;

    public class GenerateContentSimpleText {
      public static async Task main() {
        var client = new Client();
        var response = await client.Models.GenerateContentAsync(
          model: "gemini-2.5-flash", contents: "Explain how AI works in a few words"
        );
        Console.WriteLine(response.Candidates[0].Content.Parts[0].Text);
      }
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "parts": [
              {
                "text": "Explain how AI works in a few words"
              }
            ]
          }
        ]
      }'

[Start building](https://ai.google.dev/gemini-api/docs/quickstart)  
Follow our Quickstart guide to get an API key and make your first API call in minutes.

For most models, you can start with our free tier, without having to set up a billing account.

*** ** * ** ***

## Meet the models

[sparkGemini 3 Pro
Our most intelligent model, the best in the world for multimodal understanding, all built on state-of-the-art reasoning.](https://ai.google.dev/gemini-api/docs/models#gemini-3-pro)[sparkGemini 2.5 Pro
Our powerful reasoning model, which excels at coding and complex reasonings tasks.](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro)[sparkGemini 2.5 Flash
Our most balanced model, with a 1 million token context window and more.](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-2.5-flash)[sparkGemini 2.5 Flash-Lite
Our fastest and most cost-efficient multimodal model with great performance for high-frequency tasks.](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-2.5-flash-lite)[video_libraryVeo 3.1
Our state-of-the-art video generation model, with native audio.](https://ai.google.dev/gemini-api/docs/video)[ðŸŒGemini 2.5 Flash Image (Nano Banana)
State-of-the-art image generation and editing model](https://ai.google.dev/gemini-api/docs/image-generation)

## Explore Capabilities

[imagesmode
Native Image Generation (Nano Banana)
Generate and edit highly contextual images natively with Gemini 2.5 Flash Image.](https://ai.google.dev/gemini-api/docs/image-generation)[article
Long Context
Input millions of tokens to Gemini models and derive understanding from unstructured images, videos, and documents.](https://ai.google.dev/gemini-api/docs/long-context)[code
Structured Outputs
Constrain Gemini to respond with JSON, a structured data format suitable for automated processing.](https://ai.google.dev/gemini-api/docs/structured-output)[functions
Function Calling
Build agentic workflows by connecting Gemini to external APIs and tools.](https://ai.google.dev/gemini-api/docs/function-calling)[videocam
Video Generation with Veo 3.1
Create high-quality video content from text or image prompts with our state-of-the-art model.](https://ai.google.dev/gemini-api/docs/video)[android_recorder
Voice Agents with Live API
Build real-time voice applications and agents with the Live API.](https://ai.google.dev/gemini-api/docs/live)[build
Tools
Connect Gemini to the world through built-in tools like Google Search, URL Context, Google Maps, Code Execution and Computer Use.](https://ai.google.dev/gemini-api/docs/tools)[stacks
Document Understanding
Process up to 1000 pages of PDF files.](https://ai.google.dev/gemini-api/docs/document-processing)[cognition_2
Thinking
Explore how thinking capabilities improve reasoning for complex tasks and agents.](https://ai.google.dev/gemini-api/docs/thinking)

## Developer Toolkit

[AI Studio
Test prompts, manage your API keys, monitor usage, and build prototypes in our web-based IDE.
Open AI Studio](https://aistudio.google.com)[groupDeveloper Community
Ask questions and find solutions from other developers and Google engineers.
Join the community](https://discuss.ai.google.dev/c/gemini-api/4)[menu_bookAPI Reference
Find detailed information about the Gemini API in the official reference documentation.
Access the API reference](https://ai.google.dev/


<br />

This quickstart shows you how to install our[libraries](https://ai.google.dev/gemini-api/docs/libraries)and make your first Gemini API request.

## Before you begin

You need a Gemini API key. If you don't already have one, you can[get it for free in Google AI Studio](https://aistudio.google.com/app/apikey).

## Install the Google GenAI SDK

### Python

Using[Python 3.9+](https://www.python.org/downloads/), install the[`google-genai`package](https://pypi.org/project/google-genai/)using the following[pip command](https://packaging.python.org/en/latest/tutorials/installing-packages/):  

    pip install -q -U google-genai

### JavaScript

Using[Node.js v18+](https://nodejs.org/en/download/package-manager), install the[Google Gen AI SDK for TypeScript and JavaScript](https://www.npmjs.com/package/@google/genai)using the following[npm command](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):  

    npm install @google/genai

### Go

Install[google.golang.org/genai](https://pkg.go.dev/google.golang.org/genai)in your module directory using the[go get command](https://go.dev/doc/code):  

    go get google.golang.org/genai

### Java

If you're using Maven, you can install[google-genai](https://github.com/googleapis/java-genai)by adding the following to your dependencies:  

    <dependencies>
      <dependency>
        <groupId>com.google.genai</groupId>
        <artifactId>google-genai</artifactId>
        <version>1.0.0</version>
      </dependency>
    </dependencies>

### C#

Install[googleapis/go-genai](https://googleapis.github.io/dotnet-genai/)in your module directory using the[dotnet add command](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-package-add)  

    dotnet add package Google.GenAI

### Apps Script

1. To create a new Apps Script project, go to[script.new](https://script.google.com/u/0/home/projects/create).
2. Click**Untitled project**.
3. Rename the Apps Script project**AI Studio** and click**Rename**.
4. Set your[API key](https://developers.google.com/apps-script/guides/properties#manage_script_properties_manually)
   1. At the left, click**Project Settings** ![The icon for project settings](https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/settings/default/24px.svg).
   2. Under**Script Properties** click**Add script property**.
   3. For**Property** , enter the key name:`GEMINI_API_KEY`.
   4. For**Value**, enter the value for the API key.
   5. Click**Save script properties**.
5. Replace the`Code.gs`file contents with the following code:

## Make your first request

Here is an example that uses the[`generateContent`](https://ai.google.dev/api/generate-content#method:-models.generatecontent)method to send a request to the Gemini API using the Gemini 2.5 Flash model.

If you[set your API key](https://ai.google.dev/gemini-api/docs/api-key#set-api-env-var)as the environment variable`GEMINI_API_KEY`, it will be picked up automatically by the client when using the[Gemini API libraries](https://ai.google.dev/gemini-api/docs/libraries). Otherwise you will need to[pass your API key](https://ai.google.dev/gemini-api/docs/api-key#provide-api-key-explicitly)as an argument when initializing the client.

Note that all code samples in the Gemini API docs assume that you have set the environment variable`GEMINI_API_KEY`.  

### Python

    from google import genai

    # The client gets the API key from the environment variable `GEMINI_API_KEY`.
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents="Explain how AI works in a few words"
    )
    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Explain how AI works in a few words",
      });
      console.log(response.text);
    }

    main();

### Go

    package main

    import (
        "context"
        "fmt"
        "log"
        "google.golang.org/genai"
    )

    func main() {
        ctx := context.Background()
        // The client gets the API key from the environment variable `GEMINI_API_KEY`.
        client, err := genai.NewClient(ctx, nil)
        if err != nil {
            log.Fatal(err)
        }

        result, err := client.Models.GenerateContent(
            ctx,
            "gemini-2.5-flash",
            genai.Text("Explain how AI works in a few words"),
            nil,
        )
        if err != nil {
            log.Fatal(err)
        }
        fmt.Println(result.Text())
    }

### Java

    package com.example;

    import com.google.genai.Client;
    import com.google.genai.types.GenerateContentResponse;

    public class GenerateTextFromTextInput {
      public static void main(String[] args) {
        // The client gets the API key from the environment variable `GEMINI_API_KEY`.
        Client client = new Client();

        GenerateContentResponse response =
            client.models.generateContent(
                "gemini-2.5-flash",
                "Explain how AI works in a few words",
                null);

        System.out.println(response.text());
      }
    }

### C#

    using System.Threading.Tasks;
    using Google.GenAI;
    using Google.GenAI.Types;

    public class GenerateContentSimpleText {
      public static async Task main() {
        // The client gets the API key from the environment variable `GEMINI_API_KEY`.
        var client = new Client();
        var response = await client.Models.GenerateContentAsync(
          model: "gemini-2.5-flash", contents: "Explain how AI works in a few words"
        );
        Console.WriteLine(response.Candidates[0].Content.Parts[0].Text);
      }
    }

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    function main() {
      const payload = {
        contents: [
          {
            parts: [
              { text: 'Explain how AI works in a few words' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "parts": [
              {
                "text": "Explain how AI works in a few words"
              }
            ]
          }
        ]
      }'

## What's next

Now that you made your first API request, you might want to explore the following guides that show Gemini in action:

- [Text generation](https://ai.google.dev/gemini-api/docs/text-generation)
- [Image generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Thinking](https://ai.google.dev/gemini-api/docs/thinking)
- [Function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Long context](https://ai.google.dev/gemini-api/docs/long-context)
- [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings)


<br />

<br />

When building with the Gemini API, we recommend using the**Google GenAI SDK** . These are the official, production-ready libraries that we develop and maintain for the most popular languages. They are in[General Availability](https://ai.google.dev/gemini-api/docs/libraries#new-libraries)and used in all our official documentation and examples.
| **Note:** If you're using one of our legacy libraries, we strongly recommend you[migrate](https://ai.google.dev/gemini-api/docs/migrate)to the Google GenAI SDK. Review the[legacy libraries](https://ai.google.dev/gemini-api/docs/libraries#previous-sdks)section for more information.

If you're new to the Gemini API, follow our[quickstart guide](https://ai.google.dev/gemini-api/docs/quickstart)to get started.

## Language support and installation

The Google GenAI SDK is available for the Python, JavaScript/TypeScript, Go and Java languages. You can install each language's library using package managers, or visit their GitHub repos for further engagement:  

### Python

- Library:[`google-genai`](https://pypi.org/project/google-genai)

- GitHub Repository:[googleapis/python-genai](https://github.com/googleapis/python-genai)

- Installation:`pip install google-genai`

### JavaScript

- Library:[`@google/genai`](https://www.npmjs.com/package/@google/genai)

- GitHub Repository:[googleapis/js-genai](https://github.com/googleapis/js-genai)

- Installation:`npm install @google/genai`

### Go

- Library:[`google.golang.org/genai`](https://pkg.go.dev/google.golang.org/genai)

- GitHub Repository:[googleapis/go-genai](https://github.com/googleapis/go-genai)

- Installation:`go get google.golang.org/genai`

### Java

- Library:`google-genai`

- GitHub Repository:[googleapis/java-genai](https://github.com/googleapis/java-genai)

- Installation: If you're using Maven, add the following to your dependencies:

    <dependencies>
      <dependency>
        <groupId>com.google.genai</groupId>
        <artifactId>google-genai</artifactId>
        <version>1.0.0</version>
      </dependency>
    </dependencies>

### C#

- Library:`Google.GenAI`

- GitHub Repository:[googleapis/go-genai](https://googleapis.github.io/dotnet-genai/)

- Installation:`dotnet add package Google.GenAI`

## General availability

We started rolling out Google GenAI SDK, a new set of libraries to access Gemini API, in late 2024 when we launched Gemini 2.0.

As of May 2025, they reached General Availability (GA) across all supported platforms and are the recommended libraries to access the Gemini API. They are stable, fully supported for production use, and are actively maintained. They provide access to the latest features, and offer the best performance working with Gemini.

If you're using one of our legacy libraries, we strongly recommend you migrate so that you can access the latest features and get the best performance working with Gemini. Review the[legacy libraries](https://ai.google.dev/gemini-api/docs/libraries#previous-sdks)section for more information.

## Legacy libraries and migration

If you are using one of our legacy libraries, we recommend that you[migrate to the new libraries](https://ai.google.dev/gemini-api/docs/migrate).

The legacy libraries don't provide access to recent features (such as[Live API](https://ai.google.dev/gemini-api/docs/live)and[Veo](https://ai.google.dev/gemini-api/docs/video)) and are on a deprecation path. They will stop receiving updates on November 30th, 2025, the feature gaps will grow and potential bugs may no longer get fixed.

Each legacy library's support status varies, detailed in the following table:

|         Language          |                                     Legacy library                                      |                         Support status                         |                                                        Recommended library                                                        |
|---------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| **Python**                | [google-generativeai](https://github.com/google-gemini/deprecated-generative-ai-python) | All support, including bug fixes, ends on November 30th, 2025. | [google-genai](https://github.com/googleapis/python-genai)                                                                        |
| **JavaScript/TypeScript** | [@google/generativeai](https://github.com/google-gemini/generative-ai-js)               | All support, including bug fixes, ends on November 30th, 2025. | [@google/genai](https://github.com/googleapis/js-genai)                                                                           |
| **Go**                    | [google.golang.org/generative-ai](https://github.com/google/generative-ai-go)           | All support, including bug fixes, ends on November 30th, 2025. | [google.golang.org/genai](https://github.com/googleapis/go-genai)                                                                 |
| **Dart and Flutter**      | [google_generative_ai](https://pub.dev/packages/google_generative_ai/install)           | Not actively maintained                                        | Use trusted community or third party libraries, like[firebase_ai](https://pub.dev/packages/firebase_ai), or access using REST API |
| **Swift**                 | [generative-ai-swift](https://github.com/google/generative-ai-swift)                    | Not actively maintained                                        | Use[Firebase AI Logic](https://firebase.google.com/products/firebase-ai-logic)                                                    |
| **Android**               | [generative-ai-android](https://github.com/google-gemini/generative-ai-android)         | Not actively maintained                                        | Use[Firebase AI Logic](https://firebase.google.com/products/firebase-ai-logic)                                                    |

**Note for Java developers:** There was no legacy Google-provided Java SDK for the Gemini API, so no migration from a previous Google library is required. You can start directly with the new library in the[Language support and installation](https://ai.google.dev/gemini-api/docs/libraries#install)section.

## Prompt templates for code generation

Generative models (e.g., Gemini, Claude) and AI-powered IDEs (e.g., Cursor) may produce code for the Gemini API using outdated or deprecated libraries due to their training data cutoff. For the generated code to use the latest, recommended libraries, provide version and usage guidance directly in your prompts. You can use the templates below to provide the necessary context:

- [Python](https://github.com/googleapis/python-genai/blob/main/codegen_instructions.md)

- [JavaScript/TypeScript](https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md)


<br />

Rate limits regulate the number of requests you can make to the Gemini API within a given timeframe. These limits help maintain fair usage, protect against abuse, and help maintain system performance for all users.

[View your active rate limits in AI Studio](https://aistudio.google.com/usage?timeRange=last-28-days&tab=rate-limit)

## How rate limits work

Rate limits are usually measured across three dimensions:

- Requests per minute (**RPM**)
- Tokens per minute (input) (**TPM**)
- Requests per day (**RPD**)

Your usage is evaluated against each limit, and exceeding any of them will trigger a rate limit error. For example, if your RPM limit is 20, making 21 requests within a minute will result in an error, even if you haven't exceeded your TPM or other limits.

Rate limits are applied per project, not per API key.

Requests per day (**RPD**) quotas reset at midnight Pacific time.

Limits vary depending on the specific model being used, and some limits only apply to specific models. For example, Images per minute, or IPM, is only calculated for models capable of generating images (Imagen 3), but is conceptually similar to TPM. Other models might have a token per day limit (TPD).

Rate limits are more restricted for experimental and preview models.

## Usage tiers

Rate limits are tied to the project's usage tier. As your API usage and spending increase, you'll have an option to upgrade to a higher tier with increased rate limits.

The qualifications for Tiers 2 and 3 are based on the total cumulative spending on Google Cloud services (including, but not limited to, the Gemini API) for the billing account linked to your project.

|  Tier  |                                               Qualifications                                               |
|--------|------------------------------------------------------------------------------------------------------------|
| Free   | Users in[eligible countries](https://ai.google.dev/gemini-api/docs/available-regions)                      |
| Tier 1 | Billing account[linked to the project](https://ai.google.dev/gemini-api/docs/billing#enable-cloud-billing) |
| Tier 2 | Total spend: \> $250 and at least 30 days since successful payment                                         |
| Tier 3 | Total spend: \> $1,000 and at least 30 days since successful payment                                       |

When you request an upgrade, our automated abuse protection system performs additional checks. While meeting the stated qualification criteria is generally sufficient for approval, in rare cases an upgrade request may be denied based on other factors identified during the review process.

This system helps maintain the security and integrity of the Gemini API platform for all users.

## Standard API rate limits

The following table lists the rate limits for all standard Gemini API calls.
**Note:** Any values that show`*`have no published rate limits. Models are only listed under tiers in which they're available.  

### Free Tier

|                   Model                   | RPM |    TPM    |  RPD   |
|                          Text-out models                          ||||
|-------------------------------------------|-----|-----------|--------|
| Gemini 2.5 Pro                            | 2   | 125,000   | 50     |
| Gemini 2.5 Flash                          | 10  | 250,000   | 250    |
| Gemini 2.5 Flash Preview                  | 10  | 250,000   | 250    |
| Gemini 2.5 Flash-Lite                     | 15  | 250,000   | 1,000  |
| Gemini 2.5 Flash-Lite Preview             | 15  | 250,000   | 1,000  |
| Gemini 2.0 Flash                          | 15  | 1,000,000 | 200    |
| Gemini 2.0 Flash-Lite                     | 30  | 1,000,000 | 200    |
| Gemini 2.5 Flash Live                     | \*  | 1,000,000 | \*     |
| Gemini 2.5 Flash Preview Native Audio     | \*  | 500,000   | \*     |
| Gemini 2.0 Flash Live                     | \*  | 1,000,000 | \*     |
| Gemini 2.5 Flash Preview TTS              | 3   | 10,000    | 15     |
| Gemini 2.0 Flash Preview Image Generation | 10  | 200,000   | 100    |
| Gemma 3 \& 3n                             | 30  | 15,000    | 14,400 |
| Gemini Embedding                          | 100 | 30,000    | 1,000  |
| Gemini Robotics-ER 1.5 Preview            | 10  | 250,000   | 250    |
| Gemini 1.5 Flash (Deprecated)             | 15  | 250,000   | 50     |
| Gemini 1.5 Flash-8B (Deprecated)          | 15  | 250,000   | 50     |

### Tier 1

|                   Model                   |     RPM     |    TPM    |  RPD   | Batch Enqueued Tokens |
|                                         Text-out models                                          |||||
|-------------------------------------------|-------------|-----------|--------|-----------------------|
| Gemini 3 Pro Preview                      | 50          | 1,000,000 | 1,000  | 50,000,000            |
| Gemini 2.5 Pro                            | 150         | 2,000,000 | 10,000 | 5,000,000             |
| Gemini 2.5 Flash                          | 1,000       | 1,000,000 | 10,000 | 3,000,000             |
| Gemini 2.5 Flash Preview                  | 1,000       | 1,000,000 | 10,000 | 3,000,000             |
| Gemini 2.5 Flash-Lite                     | 4,000       | 4,000,000 | \*     | 10,000,000            |
| Gemini 2.5 Flash-Lite Preview             | 4,000       | 4,000,000 | \*     | 10,000,000            |
| Gemini 2.0 Flash                          | 2,000       | 4,000,000 | \*     | 10,000,000            |
| Gemini 2.0 Flash-Lite                     | 4,000       | 4,000,000 | \*     | 10,000,000            |
| Gemini 2.5 Flash Live                     | 50 sessions | 4,000,000 | \*     | \*                    |
| Gemini 2.5 Flash Preview Native Audio     | \*          | 1,000,000 | \*     | \*                    |
| Gemini 2.0 Flash Live                     | 50 sessions | 4,000,000 | \*     | \*                    |
| Gemini 3 Pro Image Preview ðŸŒ             | 20          | 100,000   | 250    | 2,000,000             |
| Gemini 2.5 Flash Preview TTS              | 10          | 10,000    | 100    | \*                    |
| Gemini 2.5 Pro Preview TTS                | 10          | 10,000    | 50     | \*                    |
| Gemini 2.5 Flash Image ðŸŒ                 | 500         | 500,000   | 2,000  | \*                    |
| Gemini 2.0 Flash Preview Image Generation | 1,000       | 1,000,000 | 10,000 | \*                    |
| Imagen 4 Standard/Fast                    | 10          | \*        | 70     | \*                    |
| Imagen 4 Ultra                            | 5           | \*        | 30     | \*                    |
| Imagen 3                                  | 20          | \*        | \*     | \*                    |
| Veo 3.1                                   | 2           | \*        | 10     | \*                    |
| Veo 3.1 Fast                              | 2           | \*        | 10     | \*                    |
| Veo 3                                     | 2           | \*        | 10     | \*                    |
| Veo 3 Fast                                | 2           | \*        | 10     | \*                    |
| Veo 2                                     | 2           | \*        | 50     | \*                    |
| Gemma 3 \& 3n                             | 30          | 15,000    | 14,400 | \*                    |
| Gemini Embedding                          | 3,000       | 1,000,000 | \*     | \*                    |
| Gemini Robotics-ER 1.5 Preview            | 300         | 1,000,000 | 10,000 | \*                    |
| Gemini 2.5 Computer Use Preview           | 150         | 2,000,000 | 10,000 | \*                    |
| Gemini 1.5 Flash (Deprecated)             | 2,000       | 4,000,000 | \*     | \*                    |
| Gemini 1.5 Flash-8B (Deprecated)          | 4,000       | 4,000,000 | \*     | \*                    |
| Gemini 1.5 Pro (Deprecated)               | 1,000       | 4,000,000 | \*     | \*                    |

### Tier 2

|                   Model                   |      RPM       |    TPM     |   RPD   | Batch Enqueued Tokens |
|                                            Text-out models                                            |||||
|-------------------------------------------|----------------|------------|---------|-----------------------|
| Gemini 3 Pro Preview                      | 1,000          | 5,000,000  | 50,000  | 500,000,000           |
| Gemini 2.5 Pro                            | 1,000          | 5,000,000  | 50,000  | 500,000,000           |
| Gemini 2.5 Flash                          | 2,000          | 3,000,000  | 100,000 | 400,000,000           |
| Gemini 2.5 Flash Preview                  | 2,000          | 3,000,000  | 100,000 | 400,000,000           |
| Gemini 2.5 Flash-Lite                     | 10,000         | 10,000,000 | \*      | 500,000,000           |
| Gemini 2.5 Flash-Lite Preview             | 10,000         | 10,000,000 | \*      | 500,000,000           |
| Gemini 2.0 Flash                          | 10,000         | 10,000,000 | \*      | 1,000,000,000         |
| Gemini 2.0 Flash-Lite                     | 20,000         | 10,000,000 | \*      | 1,000,000,000         |
| Gemini 2.5 Flash Live                     | 1,000 sessions | 10,000,000 | \*      | \*                    |
| Gemini 2.5 Flash Preview Native Audio     | \*             | 10,000,000 | \*      | \*                    |
| Gemini 2.0 Flash Live                     | 1,000 sessions | 10,000,000 | \*      | \*                    |
| Gemini 3 Pro Image Preview ðŸŒ             | 500            | 500,000    | 15,000  | 270,000,000           |
| Gemini 2.5 Flash Preview TTS              | 1,000          | 100,000    | 10,000  | \*                    |
| Gemini 2.5 Pro Preview TTS                | 100            | 25,000     | 1,000   | \*                    |
| Gemini 2.5 Flash Image ðŸŒ                 | 2,000          | 1,500,000  | 50,000  | \*                    |
| Gemini 2.0 Flash Preview Image Generation | 2,000          | 3,000,000  | 100,000 | \*                    |
| Imagen 4 Standard/Fast                    | 15             | \*         | 1000    | \*                    |
| Imagen 4 Ultra                            | 10             | \*         | 400     | \*                    |
| Imagen 3                                  | 20             | \*         | \*      | \*                    |
| Veo 3.1                                   | 4              | \*         | 50      | \*                    |
| Veo 3.1 Fast                              | 4              | \*         | 50      | \*                    |
| Veo 3                                     | 4              | \*         | 50      | \*                    |
| Veo 3 Fast                                | 4              | \*         | 50      | \*                    |
| Veo 2                                     | 2              | \*         | 50      | \*                    |
| Gemma 3 \& 3n                             | 30             | 15,000     | 14,400  | \*                    |
| Gemini Embedding                          | 5,000          | 5,000,000  | \*      | \*                    |
| Gemini Robotics-ER 1.5 Preview            | 400            | 3,000,000  | 100,000 | \*                    |
| Gemini 2.5 Computer Use Preview           | 1,000          | 5,000,000  | 50,000  | \*                    |
| Gemini 1.5 Flash (Deprecated)             | 2,000          | 4,000,000  | \*      | \*                    |
| Gemini 1.5 Flash-8B (Deprecated)          | 4,000          | 4,000,000  | \*      | \*                    |
| Gemini 1.5 Pro (Deprecated)               | 1,000          | 4,000,000  | \*      | \*                    |

### Tier 3

|                   Model                   |      RPM       |    TPM     |  RPD   | Batch Enqueued Tokens |
|                                           Text-out models                                            |||||
|-------------------------------------------|----------------|------------|--------|-----------------------|
| Gemini 3 Pro Preview                      | 2,000          | 8,000,000  | \*     | 1,000,000,000         |
| Gemini 2.5 Pro                            | 2,000          | 8,000,000  | \*     | 1,000,000,000         |
| Gemini 2.5 Flash                          | 10,000         | 8,000,000  | \*     | 1,000,000,000         |
| Gemini 2.5 Flash Preview                  | 10,000         | 8,000,000  | \*     | 1,000,000,000         |
| Gemini 2.5 Flash-Lite                     | 30,000         | 30,000,000 | \*     | 1,000,000,000         |
| Gemini 2.5 Flash-Lite Preview             | 30,000         | 30,000,000 | \*     | 1,000,000,000         |
| Gemini 2.0 Flash                          | 30,000         | 30,000,000 | \*     | 5,000,000,000         |
| Gemini 2.0 Flash-Lite                     | 30,000         | 30,000,000 | \*     | 5,000,000,000         |
| Gemini 2.5 Flash Live                     | 1,000 sessions | 10,000,000 | \*     | \*                    |
| Gemini 2.5 Flash Preview Native Audio     | \*             | 10,000,000 | \*     | \*                    |
| Gemini 2.0 Flash Live                     | 1,000 sessions | 10,000,000 | \*     | \*                    |
| Gemini 3 Pro Image Preview ðŸŒ             | 5,000          | 5,000,000  | \*     | 1,000,000,000         |
| Gemini 2.5 Flash Preview TTS              | 1,000          | 1,000,000  | \*     | \*                    |
| Gemini 2.5 Pro Preview TTS                | 100            | 1,000,000  | \*     | \*                    |
| Gemini 2.5 Flash Image ðŸŒ                 | 5,000          | 5,000,000  | \*     | \*                    |
| Gemini 2.0 Flash Preview Image Generation | 5,000          | 5,000,000  | \*     | \*                    |
| Imagen 4 Standard/Fast                    | 20             | \*         | 15,000 | \*                    |
| Imagen 4 Ultra                            | 15             | \*         | 5,000  | \*                    |
| Imagen 3                                  | 20             | \*         | \*     | \*                    |
| Veo 3.1                                   | 10             | \*         | 500    | \*                    |
| Veo 3.1 Fast                              | 10             | \*         | 500    | \*                    |
| Veo 3                                     | 10             | \*         | 500    | \*                    |
| Veo 3 Fast                                | 10             | \*         | 500    | \*                    |
| Veo 2                                     | 2              | \*         | 50     | \*                    |
| Gemma 3 \& 3n                             | 30             | 15,000     | 14,400 | \*                    |
| Gemini Embedding                          | 10,000         | 10,000,000 | \*     | \*                    |
| Gemini Robotics-ER 1.5 Preview            | 600            | 8,000,000  | \*     | \*1,000,000,000\*     |
| Gemini 2.5 Computer Use Preview           | 2,000          | 8,000,000  | \*     | \*                    |
| Gemini 1.5 Flash (Deprecated)             | 2,000          | 4,000,000  | \*     | \*                    |
| Gemini 1.5 Flash-8B (Deprecated)          | 4,000          | 4,000,000  | \*     | \*                    |
| Gemini 1.5 Pro (Deprecated)               | 1,000          | 4,000,000  | \*     | \*                    |

Specified rate limits are not guaranteed and actual capacity may vary.

## Batch API rate limits

[Batch API](https://ai.google.dev/gemini-api/docs/batch-api)requests are subject to their own rate limits, separate from the non-batch API calls.

- **Concurrent batch requests:**100
- **Input file size limit:**2GB
- **File storage limit:**20GB
- **Enqueued tokens per model:** The**Batch Enqueued Tokens** column in the rate limits table lists the maximum number of tokens that can be enqueued for batch processing across all your active batch jobs for a given model. See in the[standard API rate limits table](https://ai.google.dev/gemini-api/docs/rate-limits#current-rate-limits).

## How to upgrade to the next tier

The Gemini API uses Cloud Billing for all billing services. To transition from the Free tier to a paid tier, you must first enable Cloud Billing for your Google Cloud project.

Once your project meets the specified criteria, it becomes eligible for an upgrade to the next tier. To request an upgrade, follow these steps:

- Navigate to the[API keys page](https://aistudio.google.com/app/apikey)in AI Studio.
- Locate the project you want to upgrade and click "Upgrade". The "Upgrade" option will only show up for projects that meet[next tier qualifications](https://ai.google.dev/gemini-api/docs/rate-limits#usage-tiers).

After a quick validation, the project will be upgraded to the next tier.

## Request a rate limit increase

Each model variation has an associated rate limit (requests per minute, RPM). For details on those rate limits, see[Gemini models](https://ai.google.dev/models/gemini).

[Request paid tier rate limit increase](https://forms.gle/ETzX94k8jf7iSotH9)

We offer no guarantees about increasing your rate limit, but we'll do our best to review your request

<br />

The Gemini API can generate text output from various inputs, including text, images, video, and audio, leveraging Gemini models.

Here's a basic example that takes a single text input:  

### Python

    from google import genai

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="How does AI work?"
    )
    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "How does AI work?",
      });
      console.log(response.text);
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      result, _ := client.Models.GenerateContent(
          ctx,
          "gemini-2.5-flash",
          genai.Text("Explain how AI works in a few words"),
          nil,
      )

      fmt.Println(result.Text())
    }

### Java

    import com.google.genai.Client;
    import com.google.genai.types.GenerateContentResponse;

    public class GenerateContentWithTextInput {
      public static void main(String[] args) {

        Client client = new Client();

        GenerateContentResponse response =
            client.models.generateContent("gemini-2.5-flash", "How does AI work?", null);

        System.out.println(response.text());
      }
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "parts": [
              {
                "text": "How does AI work?"
              }
            ]
          }
        ]
      }'

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const payload = {
        contents: [
          {
            parts: [
              { text: 'How AI does work?' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

## Thinking with Gemini 2.5

2.5 Flash and Pro models have["thinking"](https://ai.google.dev/gemini-api/docs/thinking)enabled by default to enhance quality, which may take longer to run and increase token usage.

When using 2.5 Flash, you can disable thinking by setting the thinking budget to zero.

For more details, see the[thinking guide](https://ai.google.dev/gemini-api/docs/thinking#set-budget).  

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="How does AI work?",
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )
    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "How does AI work?",
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
        }
      });
      console.log(response.text);
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      result, _ := client.Models.GenerateContent(
          ctx,
          "gemini-2.5-flash",
          genai.Text("How does AI work?"),
          &genai.GenerateContentConfig{
            ThinkingConfig: &genai.ThinkingConfig{
                ThinkingBudget: int32(0), // Disables thinking
            },
          }
      )

      fmt.Println(result.Text())
    }

### Java

    import com.google.genai.Client;
    import com.google.genai.types.GenerateContentConfig;
    import com.google.genai.types.GenerateContentResponse;
    import com.google.genai.types.ThinkingConfig;

    public class GenerateContentWithThinkingConfig {
      public static void main(String[] args) {

        Client client = new Client();

        GenerateContentConfig config =
            GenerateContentConfig.builder()
                // Disables thinking
                .thinkingConfig(ThinkingConfig.builder().thinkingBudget(0))
                .build();

        GenerateContentResponse response =
            client.models.generateContent("gemini-2.5-flash", "How does AI work?", config);

        System.out.println(response.text());
      }
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "parts": [
              {
                "text": "How does AI work?"
              }
            ]
          }
        ],
        "generationConfig": {
          "thinkingConfig": {
            "thinkingBudget": 0
          }
        }
      }'

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const payload = {
        contents: [
          {
            parts: [
              { text: 'How AI does work?' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

## System instructions and other configurations

You can guide the behavior of Gemini models with system instructions. To do so, pass a[`GenerateContentConfig`](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig)object.  

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction="You are a cat. Your name is Neko."),
        contents="Hello there"
    )

    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Hello there",
        config: {
          systemInstruction: "You are a cat. Your name is Neko.",
        },
      });
      console.log(response.text);
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      config := &genai.GenerateContentConfig{
          SystemInstruction: genai.NewContentFromText("You are a cat. Your name is Neko.", genai.RoleUser),
      }

      result, _ := client.Models.GenerateContent(
          ctx,
          "gemini-2.5-flash",
          genai.Text("Hello there"),
          config,
      )

      fmt.Println(result.Text())
    }

### Java

    import com.google.genai.Client;
    import com.google.genai.types.Content;
    import com.google.genai.types.GenerateContentConfig;
    import com.google.genai.types.GenerateContentResponse;
    import com.google.genai.types.Part;

    public class GenerateContentWithSystemInstruction {
      public static void main(String[] args) {

        Client client = new Client();

        GenerateContentConfig config =
            GenerateContentConfig.builder()
                .systemInstruction(
                    Content.fromParts(Part.fromText("You are a cat. Your name is Neko.")))
                .build();

        GenerateContentResponse response =
            client.models.generateContent("gemini-2.5-flash", "Hello there", config);

        System.out.println(response.text());
      }
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -d '{
        "system_instruction": {
          "parts": [
            {
              "text": "You are a cat. Your name is Neko."
            }
          ]
        },
        "contents": [
          {
            "parts": [
              {
                "text": "Hello there"
              }
            ]
          }
        ]
      }'

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const systemInstruction = {
        parts: [{
          text: 'You are a cat. Your name is Neko.'
        }]
      };

      const payload = {
        systemInstruction,
        contents: [
          {
            parts: [
              { text: 'Hello there' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

The[`GenerateContentConfig`](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig)object also lets you override default generation parameters, such as[temperature](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig).
When using Gemini 3 models, we strongly recommend keeping the`temperature`at its default value of 1.0. Changing the temperature (setting it below 1.0) may lead to unexpected behavior, such as looping or degraded performance, particularly in complex mathematical or reasoning tasks.  

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=["Explain how AI works"],
        config=types.GenerateContentConfig(
            temperature=0.1
        )
    )
    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Explain how AI works",
        config: {
          temperature: 0.1,
        },
      });
      console.log(response.text);
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      temp := float32(0.9)
      topP := float32(0.5)
      topK := float32(20.0)

      config := &genai.GenerateContentConfig{
        Temperature:       &temp,
        TopP:              &topP,
        TopK:              &topK,
        ResponseMIMEType:  "application/json",
      }

      result, _ := client.Models.GenerateContent(
        ctx,
        "gemini-2.5-flash",
        genai.Text("What is the average size of a swallow?"),
        config,
      )

      fmt.Println(result.Text())
    }

### Java

    import com.google.genai.Client;
    import com.google.genai.types.GenerateContentConfig;
    import com.google.genai.types.GenerateContentResponse;

    public class GenerateContentWithConfig {
      public static void main(String[] args) {

        Client client = new Client();

        GenerateContentConfig config = GenerateContentConfig.builder().temperature(0.1f).build();

        GenerateContentResponse response =
            client.models.generateContent("gemini-2.5-flash", "Explain how AI works", config);

        System.out.println(response.text());
      }
    }

### REST

    curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "parts": [
              {
                "text": "Explain how AI works"
              }
            ]
          }
        ],
        "generationConfig": {
          "stopSequences": [
            "Title"
          ],
          "temperature": 1.0,
          "topP": 0.8,
          "topK": 10
        }
      }'

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        responseMimeType: 'text/plain',
      };

      const payload = {
        generationConfig,
        contents: [
          {
            parts: [
              { text: 'Explain how AI works in a few words' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

Refer to the[`GenerateContentConfig`](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig)in our API reference for a complete list of configurable parameters and their descriptions.

## Multimodal inputs

The Gemini API supports multimodal inputs, allowing you to combine text with media files. The following example demonstrates providing an image:  

### Python

    from PIL import Image
    from google import genai

    client = genai.Client()

    image = Image.open("/path/to/organ.png")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[image, "Tell me about this instrument"]
    )
    print(response.text)

### JavaScript

    import {
      GoogleGenAI,
      createUserContent,
      createPartFromUri,
    } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const image = await ai.files.upload({
        file: "/path/to/organ.png",
      });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          createUserContent([
            "Tell me about this instrument",
            createPartFromUri(image.uri, image.mimeType),
          ]),
        ],
      });
      console.log(response.text);
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      imagePath := "/path/to/organ.jpg"
      imgData, _ := os.ReadFile(imagePath)

      parts := []*genai.Part{
          genai.NewPartFromText("Tell me about this instrument"),
          &genai.Part{
              InlineData: &genai.Blob{
                  MIMEType: "image/jpeg",
                  Data:     imgData,
              },
          },
      }

      contents := []*genai.Content{
          genai.NewContentFromParts(parts, genai.RoleUser),
      }

      result, _ := client.Models.GenerateContent(
          ctx,
          "gemini-2.5-flash",
          contents,
          nil,
      )

      fmt.Println(result.Text())
    }

### Java

    import com.google.genai.Client;
    import com.google.genai.Content;
    import com.google.genai.types.GenerateContentResponse;
    import com.google.genai.types.Part;

    public class GenerateContentWithMultiModalInputs {
      public static void main(String[] args) {

        Client client = new Client();

        Content content =
          Content.fromParts(
              Part.fromText("Tell me about this instrument"),
              Part.fromUri("/path/to/organ.jpg", "image/jpeg"));

        GenerateContentResponse response =
            client.models.generateContent("gemini-2.5-flash", content, null);

        System.out.println(response.text());
      }
    }

### REST

    # Use a temporary file to hold the base64 encoded image data
    TEMP_B64=$(mktemp)
    trap 'rm -f "$TEMP_B64"' EXIT
    base64 $B64FLAGS $IMG_PATH > "$TEMP_B64"

    # Use a temporary file to hold the JSON payload
    TEMP_JSON=$(mktemp)
    trap 'rm -f "$TEMP_JSON"' EXIT

    cat > "$TEMP_JSON" << EOF
    {
      "contents": [
        {
          "parts": [
            {
              "text": "Tell me about this instrument"
            },
            {
              "inline_data": {
                "mime_type": "image/jpeg",
                "data": "$(cat "$TEMP_B64")"
              }
            }
          ]
        }
      ]
    }
    EOF

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d "@$TEMP_JSON"

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const imageUrl = 'http://image/url';
      const image = getImageData(imageUrl);
      const payload = {
        contents: [
          {
            parts: [
              { image },
              { text: 'Tell me about this instrument' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

    function getImageData(url) {
      const blob = UrlFetchApp.fetch(url).getBlob();

      return {
        mimeType: blob.getContentType(),
        data: Utilities.base64Encode(blob.getBytes())
      };
    }

For alternative methods of providing images and more advanced image processing, see our[image understanding guide](https://ai.google.dev/gemini-api/docs/image-understanding). The API also supports[document](https://ai.google.dev/gemini-api/docs/document-processing),[video](https://ai.google.dev/gemini-api/docs/video-understanding), and[audio](https://ai.google.dev/gemini-api/docs/audio)inputs and understanding.

## Streaming responses

By default, the model returns a response only after the entire generation process is complete.

For more fluid interactions, use streaming to receive[`GenerateContentResponse`](https://ai.google.dev/api/generate-content#v1beta.GenerateContentResponse)instances incrementally as they're generated.  

### Python

    from google import genai

    client = genai.Client()

    response = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=["Explain how AI works"]
    )
    for chunk in response:
        print(chunk.text, end="")

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: "Explain how AI works",
      });

      for await (const chunk of response) {
        console.log(chunk.text);
      }
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      stream := client.Models.GenerateContentStream(
          ctx,
          "gemini-2.5-flash",
          genai.Text("Write a story about a magic backpack."),
          nil,
      )

      for chunk, _ := range stream {
          part := chunk.Candidates[0].Content.Parts[0]
          fmt.Print(part.Text)
      }
    }

### Java

    import com.google.genai.Client;
    import com.google.genai.ResponseStream;
    import com.google.genai.types.GenerateContentResponse;

    public class GenerateContentStream {
      public static void main(String[] args) {

        Client client = new Client();

        ResponseStream<GenerateContentResponse> responseStream =
          client.models.generateContentStream(
              "gemini-2.5-flash", "Write a story about a magic backpack.", null);

        for (GenerateContentResponse res : responseStream) {
          System.out.print(res.text());
        }

        // To save resources and avoid connection leaks, it is recommended to close the response
        // stream after consumption (or using try block to get the response stream).
        responseStream.close();
      }
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      --no-buffer \
      -d '{
        "contents": [
          {
            "parts": [
              {
                "text": "Explain how AI works"
              }
            ]
          }
        ]
      }'

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const payload = {
        contents: [
          {
            parts: [
              { text: 'Explain how AI works' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

## Multi-turn conversations (chat)

Our SDKs provide functionality to collect multiple rounds of prompts and responses into a chat, giving you an easy way to keep track of the conversation history.
**Note:** Chat functionality is only implemented as part of the SDKs. Behind the scenes, it still uses the[`generateContent`](https://ai.google.dev/api/generate-content#method:-models.generatecontent)API. For multi-turn conversations, the full conversation history is sent to the model with each follow-up turn.  

### Python

    from google import genai

    client = genai.Client()
    chat = client.chats.create(model="gemini-2.5-flash")

    response = chat.send_message("I have 2 dogs in my house.")
    print(response.text)

    response = chat.send_message("How many paws are in my house?")
    print(response.text)

    for message in chat.get_history():
        print(f'role - {message.role}',end=": ")
        print(message.parts[0].text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
      });

      const response1 = await chat.sendMessage({
        message: "I have 2 dogs in my house.",
      });
      console.log("Chat response 1:", response1.text);

      const response2 = await chat.sendMessage({
        message: "How many paws are in my house?",
      });
      console.log("Chat response 2:", response2.text);
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      history := []*genai.Content{
          genai.NewContentFromText("Hi nice to meet you! I have 2 dogs in my house.", genai.RoleUser),
          genai.NewContentFromText("Great to meet you. What would you like to know?", genai.RoleModel),
      }

      chat, _ := client.Chats.Create(ctx, "gemini-2.5-flash", nil, history)
      res, _ := chat.SendMessage(ctx, genai.Part{Text: "How many paws are in my house?"})

      if len(res.Candidates) > 0 {
          fmt.Println(res.Candidates[0].Content.Parts[0].Text)
      }
    }

### Java

    import com.google.genai.Chat;
    import com.google.genai.Client;
    import com.google.genai.types.Content;
    import com.google.genai.types.GenerateContentResponse;

    public class MultiTurnConversation {
      public static void main(String[] args) {

        Client client = new Client();
        Chat chatSession = client.chats.create("gemini-2.5-flash");

        GenerateContentResponse response =
            chatSession.sendMessage("I have 2 dogs in my house.");
        System.out.println("First response: " + response.text());

        response = chatSession.sendMessage("How many paws are in my house?");
        System.out.println("Second response: " + response.text());

        // Get the history of the chat session.
        // Passing 'true' to getHistory() returns the curated history, which excludes
        // empty or invalid parts.
        // Passing 'false' here would return the comprehensive history, including
        // empty or invalid parts.
        ImmutableList<Content> history = chatSession.getHistory(true);
        System.out.println("History: " + history);
      }
    }

### REST

    curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "role": "user",
            "parts": [
              {
                "text": "Hello"
              }
            ]
          },
          {
            "role": "model",
            "parts": [
              {
                "text": "Great to meet you. What would you like to know?"
              }
            ]
          },
          {
            "role": "user",
            "parts": [
              {
                "text": "I have two dogs in my house. How many paws are in my house?"
              }
            ]
          }
        ]
      }'

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Hello' },
            ],
          },
          {
            role: 'model',
            parts: [
              { text: 'Great to meet you. What would you like to know?' },
            ],
          },
          {
            role: 'user',
            parts: [
              { text: 'I have two dogs in my house. How many paws are in my house?' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

Streaming can also be used for multi-turn conversations.  

### Python

    from google import genai

    client = genai.Client()
    chat = client.chats.create(model="gemini-2.5-flash")

    response = chat.send_message_stream("I have 2 dogs in my house.")
    for chunk in response:
        print(chunk.text, end="")

    response = chat.send_message_stream("How many paws are in my house?")
    for chunk in response:
        print(chunk.text, end="")

    for message in chat.get_history():
        print(f'role - {message.role}', end=": ")
        print(message.parts[0].text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
      });

      const stream1 = await chat.sendMessageStream({
        message: "I have 2 dogs in my house.",
      });
      for await (const chunk of stream1) {
        console.log(chunk.text);
        console.log("_".repeat(80));
      }

      const stream2 = await chat.sendMessageStream({
        message: "How many paws are in my house?",
      });
      for await (const chunk of stream2) {
        console.log(chunk.text);
        console.log("_".repeat(80));
      }
    }

    await main();

### Go

    package main

    import (
      "context"
      "fmt"
      "os"
      "google.golang.org/genai"
    )

    func main() {

      ctx := context.Background()
      client, err := genai.NewClient(ctx, nil)
      if err != nil {
          log.Fatal(err)
      }

      history := []*genai.Content{
          genai.NewContentFromText("Hi nice to meet you! I have 2 dogs in my house.", genai.RoleUser),
          genai.NewContentFromText("Great to meet you. What would you like to know?", genai.RoleModel),
      }

      chat, _ := client.Chats.Create(ctx, "gemini-2.5-flash", nil, history)
      stream := chat.SendMessageStream(ctx, genai.Part{Text: "How many paws are in my house?"})

      for chunk, _ := range stream {
          part := chunk.Candidates[0].Content.Parts[0]
          fmt.Print(part.Text)
      }
    }

### Java

    import com.google.genai.Chat;
    import com.google.genai.Client;
    import com.google.genai.ResponseStream;
    import com.google.genai.types.GenerateContentResponse;

    public class MultiTurnConversationWithStreaming {
      public static void main(String[] args) {

        Client client = new Client();
        Chat chatSession = client.chats.create("gemini-2.5-flash");

        ResponseStream<GenerateContentResponse> responseStream =
            chatSession.sendMessageStream("I have 2 dogs in my house.", null);

        for (GenerateContentResponse response : responseStream) {
          System.out.print(response.text());
        }

        responseStream = chatSession.sendMessageStream("How many paws are in my house?", null);

        for (GenerateContentResponse response : responseStream) {
          System.out.print(response.text());
        }

        // Get the history of the chat session. History is added after the stream
        // is consumed and includes the aggregated response from the stream.
        System.out.println("History: " + chatSession.getHistory(false));
      }
    }

### REST

    curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "role": "user",
            "parts": [
              {
                "text": "Hello"
              }
            ]
          },
          {
            "role": "model",
            "parts": [
              {
                "text": "Great to meet you. What would you like to know?"
              }
            ]
          },
          {
            "role": "user",
            "parts": [
              {
                "text": "I have two dogs in my house. How many paws are in my house?"
              }
            ]
          }
        ]
      }'

### Apps Script

    // See https://developers.google.com/apps-script/guides/properties
    // for instructions on how to set the API key.
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    function main() {
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Hello' },
            ],
          },
          {
            role: 'model',
            parts: [
              { text: 'Great to meet you. What would you like to know?' },
            ],
          },
          {
            role: 'user',
            parts: [
              { text: 'I have two dogs in my house. How many paws are in my house?' },
            ],
          },
        ],
      };

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent';
      const options = {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'x-goog-api-key': apiKey,
        },
        payload: JSON.stringify(payload)
      };

      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response);
      const content = data['candidates'][0]['content']['parts'][0]['text'];
      console.log(content);
    }

## Supported models

All models in the Gemini family support text generation. To learn more about the models and their capabilities, visit the[Models](https://ai.google.dev/gemini-api/docs/models)page.

## Best practices

### Prompting tips

For basic text generation, a[zero-shot](https://ai.google.dev/gemini-api/docs/prompting-strategies#few-shot)prompt often suffices without needing examples, system instructions or specific formatting.

For more tailored outputs:

- Use[System instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions)to guide the model.
- Provide few example inputs and outputs to guide the model. This is often referred to as[few-shot](https://ai.google.dev/gemini-api/docs/prompting-strategies#few-shot)prompting.

Consult our[prompt engineering guide](https://ai.google.dev/gemini/docs/prompting-strategies)for more tips.

### Structured output

In some cases, you may need structured output, such as JSON. Refer to our[structured output](https://ai.google.dev/gemini-api/docs/structured-output)guide to learn how.

## What's next

- Try the[Gemini API getting started Colab](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_started.ipynb).
- Explore Gemini's[image](https://ai.google.dev/gemini-api/docs/image-understanding),[video](https://ai.google.dev/gemini-api/docs/video-understanding),[audio](https://ai.google.dev/gemini-api/docs/audio)and[document](https://ai.google.dev/gemini-api/docs/document-processing)understanding capabilities.
- Learn about multimodal[file prompting strategies](https://ai.google.dev/gemini-api/docs/files#prompt-guide).


<br />

You can configure Gemini models to generate responses that adhere to a provided JSON Schema. This capability guarantees predictable and parsable results, ensures format and type-safety, enables the programmatic detection of refusals, and simplifies prompting.

Using structured outputs is ideal for a wide range of applications:

- **Data extraction:**Pull specific information from unstructured text, like extracting names, dates, and amounts from an invoice.
- **Structured classification:**Classify text into predefined categories and assign structured labels, such as categorizing customer feedback by sentiment and topic.
- **Agentic workflows:**Generate structured data that can be used to call other tools or APIs, like creating a character sheet for a game or filling out a form.

In addition to supporting JSON Schema in the REST API, the Google GenAI SDKs for Python and JavaScript also make it easy to define object schemas using[Pydantic](https://docs.pydantic.dev/latest/)and[Zod](https://zod.dev/), respectively. The example below demonstrates how to extract information from unstructured text that conforms to a schema defined in code.

Recipe ExtractorContent ModerationRecursive Structures

This example demonstrates how to extract structured data from text using basic JSON Schema types like`object`,`array`,`string`, and`integer`.  

### Python

    from google import genai
    from pydantic import BaseModel, Field
    from typing import List, Optional

    class Ingredient(BaseModel):
        name: str = Field(description="Name of the ingredient.")
        quantity: str = Field(description="Quantity of the ingredient, including units.")

    class Recipe(BaseModel):
        recipe_name: str = Field(description="The name of the recipe.")
        prep_time_minutes: Optional[int] = Field(description="Optional time in minutes to prepare the recipe.")
        ingredients: List[Ingredient]
        instructions: List[str]

    client = genai.Client()

    prompt = """
    Please extract the recipe from the following text.
    The user wants to make delicious chocolate chip cookies.
    They need 2 and 1/4 cups of all-purpose flour, 1 teaspoon of baking soda,
    1 teaspoon of salt, 1 cup of unsalted butter (softened), 3/4 cup of granulated sugar,
    3/4 cup of packed brown sugar, 1 teaspoon of vanilla extract, and 2 large eggs.
    For the best part, they'll need 2 cups of semisweet chocolate chips.
    First, preheat the oven to 375Â°F (190Â°C). Then, in a small bowl, whisk together the flour,
    baking soda, and salt. In a large bowl, cream together the butter, granulated sugar, and brown sugar
    until light and fluffy. Beat in the vanilla and eggs, one at a time. Gradually beat in the dry
    ingredients until just combined. Finally, stir in the chocolate chips. Drop by rounded tablespoons
    onto ungreased baking sheets and bake for 9 to 11 minutes.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": Recipe.model_json_schema(),
        },
    )

    recipe = Recipe.model_validate_json(response.text)
    print(recipe)

### JavaScript

    import { GoogleGenAI } from "@google/genai";
    import { z } from "zod";
    import { zodToJsonSchema } from "zod-to-json-schema";

    const ingredientSchema = z.object({
      name: z.string().describe("Name of the ingredient."),
      quantity: z.string().describe("Quantity of the ingredient, including units."),
    });

    const recipeSchema = z.object({
      recipe_name: z.string().describe("The name of the recipe."),
      prep_time_minutes: z.number().optional().describe("Optional time in minutes to prepare the recipe."),
      ingredients: z.array(ingredientSchema),
      instructions: z.array(z.string()),
    });

    const ai = new GoogleGenAI({});

    const prompt = `
    Please extract the recipe from the following text.
    The user wants to make delicious chocolate chip cookies.
    They need 2 and 1/4 cups of all-purpose flour, 1 teaspoon of baking soda,
    1 teaspoon of salt, 1 cup of unsalted butter (softened), 3/4 cup of granulated sugar,
    3/4 cup of packed brown sugar, 1 teaspoon of vanilla extract, and 2 large eggs.
    For the best part, they'll need 2 cups of semisweet chocolate chips.
    First, preheat the oven to 375Â°F (190Â°C). Then, in a small bowl, whisk together the flour,
    baking soda, and salt. In a large bowl, cream together the butter, granulated sugar, and brown sugar
    until light and fluffy. Beat in the vanilla and eggs, one at a time. Gradually beat in the dry
    ingredients until just combined. Finally, stir in the chocolate chips. Drop by rounded tablespoons
    onto ungreased baking sheets and bake for 9 to 11 minutes.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(recipeSchema),
      },
    });

    const recipe = recipeSchema.parse(JSON.parse(response.text));
    console.log(recipe);

### Go

    package main

    import (
        "context"
        "fmt"
        "log"

        "google.golang.org/genai"
    )

    func main() {
        ctx := context.Background()
        client, err := genai.NewClient(ctx, nil)
        if err != nil {
            log.Fatal(err)
        }

        prompt := `
      Please extract the recipe from the following text.
      The user wants to make delicious chocolate chip cookies.
      They need 2 and 1/4 cups of all-purpose flour, 1 teaspoon of baking soda,
      1 teaspoon of salt, 1 cup of unsalted butter (softened), 3/4 cup of granulated sugar,
      3/4 cup of packed brown sugar, 1 teaspoon of vanilla extract, and 2 large eggs.
      For the best part, they'll need 2 cups of semisweet chocolate chips.
      First, preheat the oven to 375Â°F (190Â°C). Then, in a small bowl, whisk together the flour,
      baking soda, and salt. In a large bowl, cream together the butter, granulated sugar, and brown sugar
      until light and fluffy. Beat in the vanilla and eggs, one at a time. Gradually beat in the dry
      ingredients until just combined. Finally, stir in the chocolate chips. Drop by rounded tablespoons
      onto ungreased baking sheets and bake for 9 to 11 minutes.
      `
        config := &genai.GenerateContentConfig{
            ResponseMIMEType: "application/json",
            ResponseJsonSchema: map[string]any{
                "type": "object",
                "properties": map[string]any{
                    "recipe_name": map[string]any{
                        "type":        "string",
                        "description": "The name of the recipe.",
                    },
                    "prep_time_minutes": map[string]any{
                        "type":        "integer",
                        "description": "Optional time in minutes to prepare the recipe.",
                    },
                    "ingredients": map[string]any{
                        "type": "array",
                        "items": map[string]any{
                            "type": "object",
                            "properties": map[string]any{
                                "name": map[string]any{
                                    "type":        "string",
                                    "description": "Name of the ingredient.",
                                },
                                "quantity": map[string]any{
                                    "type":        "string",
                                    "description": "Quantity of the ingredient, including units.",
                                },
                            },
                            "required": []string{"name", "quantity"},
                        },
                    },
                    "instructions": map[string]any{
                        "type":  "array",
                        "items": map[string]any{"type": "string"},
                    },
                },
                "required": []string{"recipe_name", "ingredients", "instructions"},
            },
        }

        result, err := client.Models.GenerateContent(
            ctx,
            "gemini-2.5-flash",
            genai.Text(prompt),
            config,
        )
        if err != nil {
            log.Fatal(err)
        }
        fmt.Println(result.Text())
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
        -H "x-goog-api-key: $GEMINI_API_KEY" \
        -H 'Content-Type: application/json' \
        -X POST \
        -d '{
          "contents": [{
            "parts":[
              { "text": "Please extract the recipe from the following text.\nThe user wants to make delicious chocolate chip cookies.\nThey need 2 and 1/4 cups of all-purpose flour, 1 teaspoon of baking soda,\n1 teaspoon of salt, 1 cup of unsalted butter (softened), 3/4 cup of granulated sugar,\n3/4 cup of packed brown sugar, 1 teaspoon of vanilla extract, and 2 large eggs.\nFor the best part, they will need 2 cups of semisweet chocolate chips.\nFirst, preheat the oven to 375Â°F (190Â°C). Then, in a small bowl, whisk together the flour,\nbaking soda, and salt. In a large bowl, cream together the butter, granulated sugar, and brown sugar\nuntil light and fluffy. Beat in the vanilla and eggs, one at a time. Gradually beat in the dry\ningredients until just combined. Finally, stir in the chocolate chips. Drop by rounded tablespoons\nonto ungreased baking sheets and bake for 9 to 11 minutes." }
            ]
          }],
          "generationConfig": {
            "responseMimeType": "application/json",
            "responseJsonSchema": {
              "type": "object",
              "properties": {
                "recipe_name": {
                  "type": "string",
                  "description": "The name of the recipe."
                },
                "prep_time_minutes": {
                    "type": "integer",
                    "description": "Optional time in minutes to prepare the recipe."
                },
                "ingredients": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string", "description": "Name of the ingredient."},
                      "quantity": { "type": "string", "description": "Quantity of the ingredient, including units."}
                    },
                    "required": ["name", "quantity"]
                  }
                },
                "instructions": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              },
              "required": ["recipe_name", "ingredients", "instructions"]
            }
          }
        }'

**Example Response:**  

    {
      "recipe_name": "Delicious Chocolate Chip Cookies",
      "ingredients": [
        {
          "name": "all-purpose flour",
          "quantity": "2 and 1/4 cups"
        },
        {
          "name": "baking soda",
          "quantity": "1 teaspoon"
        },
        {
          "name": "salt",
          "quantity": "1 teaspoon"
        },
        {
          "name": "unsalted butter (softened)",
          "quantity": "1 cup"
        },
        {
          "name": "granulated sugar",
          "quantity": "3/4 cup"
        },
        {
          "name": "packed brown sugar",
          "quantity": "3/4 cup"
        },
        {
          "name": "vanilla extract",
          "quantity": "1 teaspoon"
        },
        {
          "name": "large eggs",
          "quantity": "2"
        },
        {
          "name": "semisweet chocolate chips",
          "quantity": "2 cups"
        }
      ],
      "instructions": [
        "Preheat the oven to 375Â°F (190Â°C).",
        "In a small bowl, whisk together the flour, baking soda, and salt.",
        "In a large bowl, cream together the butter, granulated sugar, and brown sugar until light and fluffy.",
        "Beat in the vanilla and eggs, one at a time.",
        "Gradually beat in the dry ingredients until just combined.",
        "Stir in the chocolate chips.",
        "Drop by rounded tablespoons onto ungreased baking sheets and bake for 9 to 11 minutes."
      ]
    }

## Streaming

You can stream structured outputs, which allows you to start processing the response as it's being generated, without having to wait for the entire output to be complete. This can improve the perceived performance of your application.

The streamed chunks will be valid partial JSON strings, which can be concatenated to form the final, complete JSON object.  

### Python

    from google import genai
    from pydantic import BaseModel, Field
    from typing import Literal

    class Feedback(BaseModel):
        sentiment: Literal["positive", "neutral", "negative"]
        summary: str

    client = genai.Client()
    prompt = "The new UI is incredibly intuitive and visually appealing. Great job. Add a very long summary to test streaming!"

    response_stream = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": Feedback.model_json_schema(),
        },
    )

    for chunk in response_stream:
        print(chunk.candidates[0].content.parts[0].text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";
    import { z } from "zod";
    import { zodToJsonSchema } from "zod-to-json-schema";

    const ai = new GoogleGenAI({});
    const prompt = "The new UI is incredibly intuitive and visually appealing. Great job! Add a very long summary to test streaming!";

    const feedbackSchema = z.object({
      sentiment: z.enum(["positive", "neutral", "negative"]),
      summary: z.string(),
    });

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(feedbackSchema),
      },
    });

    for await (const chunk of stream) {
      console.log(chunk.candidates[0].content.parts[0].text)
    }

## Structured outputs with tools

| **Preview:** This is a feature available only with the`gemini-3-pro-preview`model.

Gemini 3 lets you combine Structured Outputs with built-in tools, including[Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search),[URL Context](https://ai.google.dev/gemini-api/docs/url-context), and[Code Execution](https://ai.google.dev/gemini-api/docs/code-execution).  

### Python

    from google import genai
    from pydantic import BaseModel, Field
    from typing import List

    class MatchResult(BaseModel):
        winner: str = Field(description="The name of the winner.")
        final_match_score: str = Field(description="The final match score.")
        scorers: List[str] = Field(description="The name of the scorer.")

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-3-pro-preview",
        contents="Search for all details for the latest Euro.",
        config={
            "tools": [
                {"google_search": {}},
                {"url_context": {}}
            ],
            "response_mime_type": "application/json",
            "response_json_schema": MatchResult.model_json_schema(),
        },  
    )

    result = MatchResult.model_validate_json(response.text)
    print(result)

### JavaScript

    import { GoogleGenAI } from "@google/genai";
    import { z } from "zod";
    import { zodToJsonSchema } from "zod-to-json-schema";

    const ai = new GoogleGenAI({});

    const matchSchema = z.object({
      winner: z.string().describe("The name of the winner."),
      final_match_score: z.string().describe("The final score."),
      scorers: z.array(z.string()).describe("The name of the scorer.")
    });

    async function run() {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: "Search for all details for the latest Euro.",
        config: {
          tools: [
            { googleSearch: {} },
            { urlContext: {} }
          ],
          responseMimeType: "application/json",
          responseJsonSchema: zodToJsonSchema(matchSchema),
        },
      });

      const match = matchSchema.parse(JSON.parse(response.text));
      console.log(match);
    }

    run();

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [{
          "parts": [{"text": "Search for all details for the latest Euro."}]
        }],
        "tools": [
          {"googleSearch": {}},
          {"urlContext": {}}
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseJsonSchema": {
                "type": "object",
                "properties": {
                    "winner": {"type": "string", "description": "The name of the winner."},
                    "final_match_score": {"type": "string", "description": "The final score."},
                    "scorers": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "The name of the scorer."
                    }
                },
                "required": ["winner", "final_match_score", "scorers"]
            }
        }
      }'

## JSON schema support

To generate a JSON object, set the`response_mime_type`in the generation configuration to`application/json`and provide a`response_json_schema`. The schema must be a valid[JSON Schema](https://json-schema.org/)that describes the desired output format.

The model will then generate a response that is a syntactically valid JSON string matching the provided schema. When using structured outputs, the model will produce outputs in the same order as the keys in the schema.

Gemini's structured output mode supports a subset of the[JSON Schema](https://json-schema.org)specification.

The following values of`type`are supported:

- **`string`**: For text.
- **`number`**: For floating-point numbers.
- **`integer`**: For whole numbers.
- **`boolean`**: For true/false values.
- **`object`**: For structured data with key-value pairs.
- **`array`**: For lists of items.
- **`null`** : To allow a property to be null, include`"null"`in the type array (e.g.,`{"type": ["string", "null"]}`).

These descriptive properties help guide the model:

- **`title`**: A short description of a property.
- **`description`**: A longer and more detailed description of a property.

### Type-specific properties

**For`object`values:**

- **`properties`**: An object where each key is a property name and each value is a schema for that property.
- **`required`**: An array of strings, listing which properties are mandatory.
- **`additionalProperties`** : Controls whether properties not listed in`properties`are allowed. Can be a boolean or a schema.

**For`string`values:**

- **`enum`**: Lists a specific set of possible strings for classification tasks.
- **`format`** : Specifies a syntax for the string, such as`date-time`,`date`,`time`.

**For`number`and`integer`values:**

- **`enum`**: Lists a specific set of possible numeric values.
- **`minimum`**: The minimum inclusive value.
- **`maximum`**: The maximum inclusive value.

**For`array`values:**

- **`items`**: Defines the schema for all items in the array.
- **`prefixItems`**: Defines a list of schemas for the first N items, allowing for tuple-like structures.
- **`minItems`**: The minimum number of items in the array.
- **`maxItems`**: The maximum number of items in the array.

## Model support

The following models support structured output:

|         Model         | Structured Outputs |
|-----------------------|--------------------|
| Gemini 3 Pro Preview  | âœ”ï¸                 |
| Gemini 2.5 Pro        | âœ”ï¸                 |
| Gemini 2.5 Flash      | âœ”ï¸                 |
| Gemini 2.5 Flash-Lite | âœ”ï¸                 |
| Gemini 2.0 Flash      | âœ”ï¸\*               |
| Gemini 2.0 Flash-Lite | âœ”ï¸\*               |

*\* Note that Gemini 2.0 requires an explicit`propertyOrdering`list within the JSON input to define the preferred structure. You can find an example in this[cookbook](https://github.com/google-gemini/cookbook/blob/main/examples/Pdf_structured_outputs_on_invoices_and_forms.ipynbs).*

## Structured outputs vs. function calling

Both structured outputs and function calling use JSON schemas, but they serve different purposes:

|        Feature         |                                                                                  Primary Use Case                                                                                  |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Structured Outputs** | **Formatting the final response to the user.** Use this when you want the model's*answer*to be in a specific format (e.g., extracting data from a document to save to a database). |
| **Function Calling**   | **Taking action during the conversation.** Use this when the model needs to*ask you*to perform a task (e.g., "get current weather") before it can provide a final answer.          |

## Best practices

- **Clear descriptions:** Use the`description`field in your schema to provide clear instructions to the model about what each property represents. This is crucial for guiding the model's output.
- **Strong typing:** Use specific types (`integer`,`string`,`enum`) whenever possible. If a parameter has a limited set of valid values, use an`enum`.
- **Prompt engineering:**Clearly state in your prompt what you want the model to do. For example, "Extract the following information from the text..." or "Classify this feedback according to the provided schema...".
- **Validation:**While structured output guarantees syntactically correct JSON, it does not guarantee the values are semantically correct. Always validate the final output in your application code before using it.
- **Error handling:**Implement robust error handling in your application to gracefully manage cases where the model's output, while schema-compliant, may not meet your business logic requirements.

## Limitations

- **Schema subset:**Not all features of the JSON Schema specification are supported. The model ignores unsupported properties.
- **Schema complexity:**The API may reject very large or deeply nested schemas. If you encounter errors, try simplifying your schema by shortening property names, reducing nesting, or limiting the number of constraints.


<br />

Function calling lets you connect models to external tools and APIs. Instead of generating text responses, the model determines when to call specific functions and provides the necessary parameters to execute real-world actions. This allows the model to act as a bridge between natural language and real-world actions and data. Function calling has 3 primary use cases:

- **Augment Knowledge:**Access information from external sources like databases, APIs, and knowledge bases.
- **Extend Capabilities:**Use external tools to perform computations and extend the limitations of the model, such as using a calculator or creating charts.
- **Take Actions:**Interact with external systems using APIs, such as scheduling appointments, creating invoices, sending emails, or controlling smart home devices.

Get WeatherSchedule MeetingCreate Chart  

### Python

    from google import genai
    from google.genai import types

    # Define the function declaration for the model
    schedule_meeting_function = {
        "name": "schedule_meeting",
        "description": "Schedules a meeting with specified attendees at a given time and date.",
        "parameters": {
            "type": "object",
            "properties": {
                "attendees": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of people attending the meeting.",
                },
                "date": {
                    "type": "string",
                    "description": "Date of the meeting (e.g., '2024-07-29')",
                },
                "time": {
                    "type": "string",
                    "description": "Time of the meeting (e.g., '15:00')",
                },
                "topic": {
                    "type": "string",
                    "description": "The subject or topic of the meeting.",
                },
            },
            "required": ["attendees", "date", "time", "topic"],
        },
    }

    # Configure the client and tools
    client = genai.Client()
    tools = types.Tool(function_declarations=[schedule_meeting_function])
    config = types.GenerateContentConfig(tools=[tools])

    # Send request with function declarations
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Schedule a meeting with Bob and Alice for 03/14/2025 at 10:00 AM about the Q3 planning.",
        config=config,
    )

    # Check for a function call
    if response.candidates[0].content.parts[0].function_call:
        function_call = response.candidates[0].content.parts[0].function_call
        print(f"Function to call: {function_call.name}")
        print(f"Arguments: {function_call.args}")
        #  In a real app, you would call your function here:
        #  result = schedule_meeting(**function_call.args)
    else:
        print("No function call found in the response.")
        print(response.text)

### JavaScript

    import { GoogleGenAI, Type } from '@google/genai';

    // Configure the client
    const ai = new GoogleGenAI({});

    // Define the function declaration for the model
    const scheduleMeetingFunctionDeclaration = {
      name: 'schedule_meeting',
      description: 'Schedules a meeting with specified attendees at a given time and date.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          attendees: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of people attending the meeting.',
          },
          date: {
            type: Type.STRING,
            description: 'Date of the meeting (e.g., "2024-07-29")',
          },
          time: {
            type: Type.STRING,
            description: 'Time of the meeting (e.g., "15:00")',
          },
          topic: {
            type: Type.STRING,
            description: 'The subject or topic of the meeting.',
          },
        },
        required: ['attendees', 'date', 'time', 'topic'],
      },
    };

    // Send request with function declarations
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Schedule a meeting with Bob and Alice for 03/27/2025 at 10:00 AM about the Q3 planning.',
      config: {
        tools: [{
          functionDeclarations: [scheduleMeetingFunctionDeclaration]
        }],
      },
    });

    // Check for function calls in the response
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0]; // Assuming one function call
      console.log(`Function to call: ${functionCall.name}`);
      console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
      // In a real app, you would call your actual function here:
      // const result = await scheduleMeeting(functionCall.args);
    } else {
      console.log("No function call found in the response.");
      console.log(response.text);
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [
          {
            "role": "user",
            "parts": [
              {
                "text": "Schedule a meeting with Bob and Alice for 03/27/2025 at 10:00 AM about the Q3 planning."
              }
            ]
          }
        ],
        "tools": [
          {
            "functionDeclarations": [
              {
                "name": "schedule_meeting",
                "description": "Schedules a meeting with specified attendees at a given time and date.",
                "parameters": {
                  "type": "object",
                  "properties": {
                    "attendees": {
                      "type": "array",
                      "items": {"type": "string"},
                      "description": "List of people attending the meeting."
                    },
                    "date": {
                      "type": "string",
                      "description": "Date of the meeting (e.g., '2024-07-29')"
                    },
                    "time": {
                      "type": "string",
                      "description": "Time of the meeting (e.g., '15:00')"
                    },
                    "topic": {
                      "type": "string",
                      "description": "The subject or topic of the meeting."
                    }
                  },
                  "required": ["attendees", "date", "time", "topic"]
                }
              }
            ]
          }
        ]
      }'

## How function calling works

![function calling overview](https://ai.google.dev/static/gemini-api/docs/images/function-calling-overview.png)

Function calling involves a structured interaction between your application, the model, and external functions. Here's a breakdown of the process:

1. **Define Function Declaration:**Define the function declaration in your application code. Function Declarations describe the function's name, parameters, and purpose to the model.
2. **Call LLM with function declarations:**Send user prompt along with the function declaration(s) to the model. It analyzes the request and determines if a function call would be helpful. If so, it responds with a structured JSON object.
3. **Execute Function Code (Your Responsibility):** The Model*does not* execute the function itself. It's your application's responsibility to process the response and check for Function Call, if
   - **Yes**: Extract the name and args of the function and execute the corresponding function in your application.
   - **No:**The model has provided a direct text response to the prompt (this flow is less emphasized in the example but is a possible outcome).
4. **Create User friendly response:**If a function was executed, capture the result and send it back to the model in a subsequent turn of the conversation. It will use the result to generate a final, user-friendly response that incorporates the information from the function call.

This process can be repeated over multiple turns, allowing for complex interactions and workflows. The model also supports calling multiple functions in a single turn ([parallel function calling](https://ai.google.dev/gemini-api/docs/function-calling#parallel_function_calling)) and in sequence ([compositional function calling](https://ai.google.dev/gemini-api/docs/function-calling#compositional_function_calling)).

### Step 1: Define a function declaration

Define a function and its declaration within your application code that allows users to set light values and make an API request. This function could call external services or APIs.  

### Python

    # Define a function that the model can call to control smart lights
    set_light_values_declaration = {
        "name": "set_light_values",
        "description": "Sets the brightness and color temperature of a light.",
        "parameters": {
            "type": "object",
            "properties": {
                "brightness": {
                    "type": "integer",
                    "description": "Light level from 0 to 100. Zero is off and 100 is full brightness",
                },
                "color_temp": {
                    "type": "string",
                    "enum": ["daylight", "cool", "warm"],
                    "description": "Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.",
                },
            },
            "required": ["brightness", "color_temp"],
        },
    }

    # This is the actual function that would be called based on the model's suggestion
    def set_light_values(brightness: int, color_temp: str) -> dict[str, int | str]:
        """Set the brightness and color temperature of a room light. (mock API).

        Args:
            brightness: Light level from 0 to 100. Zero is off and 100 is full brightness
            color_temp: Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.

        Returns:
            A dictionary containing the set brightness and color temperature.
        """
        return {"brightness": brightness, "colorTemperature": color_temp}

### JavaScript

    import { Type } from '@google/genai';

    // Define a function that the model can call to control smart lights
    const setLightValuesFunctionDeclaration = {
      name: 'set_light_values',
      description: 'Sets the brightness and color temperature of a light.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          brightness: {
            type: Type.NUMBER,
            description: 'Light level from 0 to 100. Zero is off and 100 is full brightness',
          },
          color_temp: {
            type: Type.STRING,
            enum: ['daylight', 'cool', 'warm'],
            description: 'Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.',
          },
        },
        required: ['brightness', 'color_temp'],
      },
    };

    /**

    *   Set the brightness and color temperature of a room light. (mock API)
    *   @param {number} brightness - Light level from 0 to 100. Zero is off and 100 is full brightness
    *   @param {string} color_temp - Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.
    *   @return {Object} A dictionary containing the set brightness and color temperature.
    */
    function setLightValues(brightness, color_temp) {
      return {
        brightness: brightness,
        colorTemperature: color_temp
      };
    }

### Step 2: Call the model with function declarations

Once you have defined your function declarations, you can prompt the model to use them. It analyzes the prompt and function declarations and decides whether to respond directly or to call a function. If a function is called, the response object will contain a function call suggestion.  

### Python

    from google.genai import types

    # Configure the client and tools
    client = genai.Client()
    tools = types.Tool(function_declarations=[set_light_values_declaration])
    config = types.GenerateContentConfig(tools=[tools])

    # Define user prompt
    contents = [
        types.Content(
            role="user", parts=[types.Part(text="Turn the lights down to a romantic level")]
        )
    ]

    # Send request with function declarations
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents
        config=config,
    )

    print(response.candidates[0].content.parts[0].function_call)

### JavaScript

    import { GoogleGenAI } from '@google/genai';

    // Generation config with function declaration
    const config = {
      tools: [{
        functionDeclarations: [setLightValuesFunctionDeclaration]
      }]
    };

    // Configure the client
    const ai = new GoogleGenAI({});

    // Define user prompt
    const contents = [
      {
        role: 'user',
        parts: [{ text: 'Turn the lights down to a romantic level' }]
      }
    ];

    // Send request with function declarations
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: config
    });

    console.log(response.functionCalls[0]);

The model then returns a`functionCall`object in an OpenAPI compatible schema specifying how to call one or more of the declared functions in order to respond to the user's question.  

### Python

    id=None args={'color_temp': 'warm', 'brightness': 25} name='set_light_values'

### JavaScript

    {
      name: 'set_light_values',
      args: { brightness: 25, color_temp: 'warm' }
    }

### Step 3: Execute set_light_values function code

Extract the function call details from the model's response, parse the arguments , and execute the`set_light_values`function.  

### Python

    # Extract tool call details, it may not be in the first part.
    tool_call = response.candidates[0].content.parts[0].function_call

    if tool_call.name == "set_light_values":
        result = set_light_values(**tool_call.args)
        print(f"Function execution result: {result}")

### JavaScript

    // Extract tool call details
    const tool_call = response.functionCalls[0]

    let result;
    if (tool_call.name === 'set_light_values') {
      result = setLightValues(tool_call.args.brightness, tool_call.args.color_temp);
      console.log(`Function execution result: ${JSON.stringify(result)}`);
    }

### Step 4: Create user friendly response with function result and call the model again

Finally, send the result of the function execution back to the model so it can incorporate this information into its final response to the user.  

### Python

    from google import genai
    from google.genai import types

    # Create a function response part
    function_response_part = types.Part.from_function_response(
        name=tool_call.name,
        response={"result": result},
    )

    # Append function call and result of the function execution to contents
    contents.append(response.candidates[0].content) # Append the content from the model's response.
    contents.append(types.Content(role="user", parts=[function_response_part])) # Append the function response

    client = genai.Client()
    final_response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=config,
        contents=contents,
    )

    print(final_response.text)

### JavaScript

    // Create a function response part
    const function_response_part = {
      name: tool_call.name,
      response: { result }
    }

    // Append function call and result of the function execution to contents
    contents.push(response.candidates[0].content);
    contents.push({ role: 'user', parts: [{ functionResponse: function_response_part }] });

    // Get the final response from the model
    const final_response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: config
    });

    console.log(final_response.text);

This completes the function calling flow. The model successfully used the`set_light_values`function to perform the request action of the user.

## Function declarations

When you implement function calling in a prompt, you create a`tools`object, which contains one or more`function declarations`. You define functions using JSON, specifically with a[select subset](https://ai.google.dev/api/caching#Schema)of the[OpenAPI schema](https://spec.openapis.org/oas/v3.0.3#schemaw)format. A single function declaration can include the following parameters:

- `name`(string): A unique name for the function (`get_weather_forecast`,`send_email`). Use descriptive names without spaces or special characters (use underscores or camelCase).
- `description`(string): A clear and detailed explanation of the function's purpose and capabilities. This is crucial for the model to understand when to use the function. Be specific and provide examples if helpful ("Finds theaters based on location and optionally movie title which is currently playing in theaters.").
- `parameters`(object): Defines the input parameters the function expects.
  - `type`(string): Specifies the overall data type, such as`object`.
  - `properties`(object): Lists individual parameters, each with:
    - `type`(string): The data type of the parameter, such as`string`,`integer`,`boolean, array`.
    - `description`(string): A description of the parameter's purpose and format. Provide examples and constraints ("The city and state, e.g., 'San Francisco, CA' or a zip code e.g., '95616'.").
    - `enum`(array, optional): If the parameter values are from a fixed set, use "enum" to list the allowed values instead of just describing them in the description. This improves accuracy ("enum": \["daylight", "cool", "warm"\]).
  - `required`(array): An array of strings listing the parameter names that are mandatory for the function to operate.

You can also construct`FunctionDeclarations`from Python functions directly using`types.FunctionDeclaration.from_callable(client=client, callable=your_function)`.

## Function calling with thinking models

Gemini 3 and 2.5 series models use an internal["thinking"](https://ai.google.dev/gemini-api/docs/thinking)process to reason through requests. This significantly improves function calling performance, allowing the model to better determine when to call a function and which parameters to use. Because the Gemini API is stateless, models use[thought signatures](https://ai.google.dev/gemini-api/docs/thought-signatures)to maintain context across multi-turn conversations.

This section covers advanced management of thought signatures and is only necessary if you're manually constructing API requests (e.g., via REST) or manipulating conversation history.

**If you're using the[Google GenAI SDKs](https://ai.google.dev/gemini-api/docs/libraries)(our official libraries), you don't need to manage this process** . The SDKs automatically handle the necessary steps, as shown in the earlier[example](https://ai.google.dev/gemini-api/docs/function-calling#step-4).

### Managing conversation history manually

If you modify the conversation history manually, instead of sending the[complete previous response](https://ai.google.dev/gemini-api/docs/function-calling#step-4)you must correctly handle the`thought_signature`included in the model's turn.

Follow these rules to ensure the model's context is preserved:

- Always send the`thought_signature`back to the model inside its original[`Part`](https://ai.google.dev/api#request-body-structure).
- Don't merge a`Part`containing a signature with one that does not. This breaks the positional context of the thought.
- Don't combine two`Parts`that both contain signatures, as the signature strings cannot be merged.

#### Gemini 3 thought signatures

In Gemini 3, any[`Part`](https://ai.google.dev/api#request-body-structure)of a model response may contain a thought signature. While we generally recommend returning signatures from all`Part`types, passing back thought signatures is mandatory for function calling. Unless you are manipulating conversation history manually, the Google GenAI SDK will handle thought signatures automatically.

If you are manipulating conversation history manually, refer to the[Thoughts Signatures](https://ai.google.dev/gemini-api/docs/thought-signatures)page for complete guidance and details on handling thought signatures for Gemini 3.

### Inspecting thought signatures

While not necessary for implementation, you can inspect the response to see the`thought_signature`for debugging or educational purposes.  

### Python

    import base64
    # After receiving a response from a model with thinking enabled
    # response = client.models.generate_content(...)

    # The signature is attached to the response part containing the function call
    part = response.candidates[0].content.parts[0]
    if part.thought_signature:
      print(base64.b64encode(part.thought_signature).decode("utf-8"))

### JavaScript

    // After receiving a response from a model with thinking enabled
    // const response = await ai.models.generateContent(...)

    // The signature is attached to the response part containing the function call
    const part = response.candidates[0].content.parts[0];
    if (part.thoughtSignature) {
      console.log(part.thoughtSignature);
    }

Learn more about limitations and usage of thought signatures, and about thinking models in general, on the[Thinking](https://ai.google.dev/gemini-api/docs/thinking#signatures)page.

## Parallel function calling

In addition to single turn function calling, you can also call multiple functions at once. Parallel function calling lets you execute multiple functions at once and is used when the functions are not dependent on each other. This is useful in scenarios like gathering data from multiple independent sources, such as retrieving customer details from different databases or checking inventory levels across various warehouses or performing multiple actions such as converting your apartment into a disco.  

### Python

    power_disco_ball = {
        "name": "power_disco_ball",
        "description": "Powers the spinning disco ball.",
        "parameters": {
            "type": "object",
            "properties": {
                "power": {
                    "type": "boolean",
                    "description": "Whether to turn the disco ball on or off.",
                }
            },
            "required": ["power"],
        },
    }

    start_music = {
        "name": "start_music",
        "description": "Play some music matching the specified parameters.",
        "parameters": {
            "type": "object",
            "properties": {
                "energetic": {
                    "type": "boolean",
                    "description": "Whether the music is energetic or not.",
                },
                "loud": {
                    "type": "boolean",
                    "description": "Whether the music is loud or not.",
                },
            },
            "required": ["energetic", "loud"],
        },
    }

    dim_lights = {
        "name": "dim_lights",
        "description": "Dim the lights.",
        "parameters": {
            "type": "object",
            "properties": {
                "brightness": {
                    "type": "number",
                    "description": "The brightness of the lights, 0.0 is off, 1.0 is full.",
                }
            },
            "required": ["brightness"],
        },
    }

### JavaScript

    import { Type } from '@google/genai';

    const powerDiscoBall = {
      name: 'power_disco_ball',
      description: 'Powers the spinning disco ball.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          power: {
            type: Type.BOOLEAN,
            description: 'Whether to turn the disco ball on or off.'
          }
        },
        required: ['power']
      }
    };

    const startMusic = {
      name: 'start_music',
      description: 'Play some music matching the specified parameters.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          energetic: {
            type: Type.BOOLEAN,
            description: 'Whether the music is energetic or not.'
          },
          loud: {
            type: Type.BOOLEAN,
            description: 'Whether the music is loud or not.'
          }
        },
        required: ['energetic', 'loud']
      }
    };

    const dimLights = {
      name: 'dim_lights',
      description: 'Dim the lights.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          brightness: {
            type: Type.NUMBER,
            description: 'The brightness of the lights, 0.0 is off, 1.0 is full.'
          }
        },
        required: ['brightness']
      }
    };

Configure the function calling mode to allow using all of the specified tools. To learn more, you can read about[configuring function calling](https://ai.google.dev/gemini-api/docs/function-calling#function_calling_modes).  

### Python

    from google import genai
    from google.genai import types

    # Configure the client and tools
    client = genai.Client()
    house_tools = [
        types.Tool(function_declarations=[power_disco_ball, start_music, dim_lights])
    ]
    config = types.GenerateContentConfig(
        tools=house_tools,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(
            disable=True
        ),
        # Force the model to call 'any' function, instead of chatting.
        tool_config=types.ToolConfig(
            function_calling_config=types.FunctionCallingConfig(mode='ANY')
        ),
    )

    chat = client.chats.create(model="gemini-2.5-flash", config=config)
    response = chat.send_message("Turn this place into a party!")

    # Print out each of the function calls requested from this single call
    print("Example 1: Forced function calling")
    for fn in response.function_calls:
        args = ", ".join(f"{key}={val}" for key, val in fn.args.items())
        print(f"{fn.name}({args})")

### JavaScript

    import { GoogleGenAI } from '@google/genai';

    // Set up function declarations
    const houseFns = [powerDiscoBall, startMusic, dimLights];

    const config = {
        tools: [{
            functionDeclarations: houseFns
        }],
        // Force the model to call 'any' function, instead of chatting.
        toolConfig: {
            functionCallingConfig: {
                mode: 'any'
            }
        }
    };

    // Configure the client
    const ai = new GoogleGenAI({});

    // Create a chat session
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: config
    });
    const response = await chat.sendMessage({message: 'Turn this place into a party!'});

    // Print out each of the function calls requested from this single call
    console.log("Example 1: Forced function calling");
    for (const fn of response.functionCalls) {
        const args = Object.entries(fn.args)
            .map(([key, val]) => `${key}=${val}`)
            .join(', ');
        console.log(`${fn.name}(${args})`);
    }

Each of the printed results reflects a single function call that the model has requested. To send the results back, include the responses in the same order as they were requested.

The Python SDK supports[automatic function calling](https://ai.google.dev/gemini-api/docs/function-calling#automatic_function_calling_python_only), which automatically converts Python functions to declarations, handles the function call execution and response cycle for you. Following is an example for the disco use case.
**Note:** Automatic Function Calling is a Python SDK only feature at the moment.  

### Python

    from google import genai
    from google.genai import types

    # Actual function implementations
    def power_disco_ball_impl(power: bool) -> dict:
        """Powers the spinning disco ball.

        Args:
            power: Whether to turn the disco ball on or off.

        Returns:
            A status dictionary indicating the current state.
        """
        return {"status": f"Disco ball powered {'on' if power else 'off'}"}

    def start_music_impl(energetic: bool, loud: bool) -> dict:
        """Play some music matching the specified parameters.

        Args:
            energetic: Whether the music is energetic or not.
            loud: Whether the music is loud or not.

        Returns:
            A dictionary containing the music settings.
        """
        music_type = "energetic" if energetic else "chill"
        volume = "loud" if loud else "quiet"
        return {"music_type": music_type, "volume": volume}

    def dim_lights_impl(brightness: float) -> dict:
        """Dim the lights.

        Args:
            brightness: The brightness of the lights, 0.0 is off, 1.0 is full.

        Returns:
            A dictionary containing the new brightness setting.
        """
        return {"brightness": brightness}

    # Configure the client
    client = genai.Client()
    config = types.GenerateContentConfig(
        tools=[power_disco_ball_impl, start_music_impl, dim_lights_impl]
    )

    # Make the request
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Do everything you need to this place into party!",
        config=config,
    )

    print("\nExample 2: Automatic function calling")
    print(response.text)
    # I've turned on the disco ball, started playing loud and energetic music, and dimmed the lights to 50% brightness. Let's get this party started!

## Compositional function calling

Compositional or sequential function calling allows Gemini to chain multiple function calls together to fulfill a complex request. For example, to answer "Get the temperature in my current location", the Gemini API might first invoke a`get_current_location()`function followed by a`get_weather()`function that takes the location as a parameter.

The following example demonstrates how to implement compositional function calling using the Python SDK and automatic function calling.  

### Python

This example uses the automatic function calling feature of the`google-genai`Python SDK. The SDK automatically converts the Python functions to the required schema, executes the function calls when requested by the model, and sends the results back to the model to complete the task.  

    import os
    from google import genai
    from google.genai import types

    # Example Functions
    def get_weather_forecast(location: str) -> dict:
        """Gets the current weather temperature for a given location."""
        print(f"Tool Call: get_weather_forecast(location={location})")
        # TODO: Make API call
        print("Tool Response: {'temperature': 25, 'unit': 'celsius'}")
        return {"temperature": 25, "unit": "celsius"}  # Dummy response

    def set_thermostat_temperature(temperature: int) -> dict:
        """Sets the thermostat to a desired temperature."""
        print(f"Tool Call: set_thermostat_temperature(temperature={temperature})")
        # TODO: Interact with a thermostat API
        print("Tool Response: {'status': 'success'}")
        return {"status": "success"}

    # Configure the client and model
    client = genai.Client()
    config = types.GenerateContentConfig(
        tools=[get_weather_forecast, set_thermostat_temperature]
    )

    # Make the request
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="If it's warmer than 20°C in London, set the thermostat to 20°C, otherwise set it to 18°C.",
        config=config,
    )

    # Print the final, user-facing response
    print(response.text)

**Expected Output**

When you run the code, you will see the SDK orchestrating the function calls. The model first calls`get_weather_forecast`, receives the temperature, and then calls`set_thermostat_temperature`with the correct value based on the logic in the prompt.  

    Tool Call: get_weather_forecast(location=London)
    Tool Response: {'temperature': 25, 'unit': 'celsius'}
    Tool Call: set_thermostat_temperature(temperature=20)
    Tool Response: {'status': 'success'}
    OK. I've set the thermostat to 20°C.

### JavaScript

This example shows how to use JavaScript/TypeScript SDK to do comopositional function calling using a manual execution loop.  

    import { GoogleGenAI, Type } from "@google/genai";

    // Configure the client
    const ai = new GoogleGenAI({});

    // Example Functions
    function get_weather_forecast({ location }) {
      console.log(`Tool Call: get_weather_forecast(location=${location})`);
      // TODO: Make API call
      console.log("Tool Response: {'temperature': 25, 'unit': 'celsius'}");
      return { temperature: 25, unit: "celsius" };
    }

    function set_thermostat_temperature({ temperature }) {
      console.log(
        `Tool Call: set_thermostat_temperature(temperature=${temperature})`,
      );
      // TODO: Make API call
      console.log("Tool Response: {'status': 'success'}");
      return { status: "success" };
    }

    const toolFunctions = {
      get_weather_forecast,
      set_thermostat_temperature,
    };

    const tools = [
      {
        functionDeclarations: [
          {
            name: "get_weather_forecast",
            description:
              "Gets the current weather temperature for a given location.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                location: {
                  type: Type.STRING,
                },
              },
              required: ["location"],
            },
          },
          {
            name: "set_thermostat_temperature",
            description: "Sets the thermostat to a desired temperature.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                temperature: {
                  type: Type.NUMBER,
                },
              },
              required: ["temperature"],
            },
          },
        ],
      },
    ];

    // Prompt for the model
    let contents = [
      {
        role: "user",
        parts: [
          {
            text: "If it's warmer than 20°C in London, set the thermostat to 20°C, otherwise set it to 18°C.",
          },
        ],
      },
    ];

    // Loop until the model has no more function calls to make
    while (true) {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { tools },
      });

      if (result.functionCalls && result.functionCalls.length > 0) {
        const functionCall = result.functionCalls[0];

        const { name, args } = functionCall;

        if (!toolFunctions[name]) {
          throw new Error(`Unknown function call: ${name}`);
        }

        // Call the function and get the response.
        const toolResponse = toolFunctions[name](args);

        const functionResponsePart = {
          name: functionCall.name,
          response: {
            result: toolResponse,
          },
        };

        // Send the function response back to the model.
        contents.push({
          role: "model",
          parts: [
            {
              functionCall: functionCall,
            },
          ],
        });
        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: functionResponsePart,
            },
          ],
        });
      } else {
        // No more function calls, break the loop.
        console.log(result.text);
        break;
      }
    }

**Expected Output**

When you run the code, you will see the SDK orchestrating the function calls. The model first calls`get_weather_forecast`, receives the temperature, and then calls`set_thermostat_temperature`with the correct value based on the logic in the prompt.  

    Tool Call: get_weather_forecast(location=London)
    Tool Response: {'temperature': 25, 'unit': 'celsius'}
    Tool Call: set_thermostat_temperature(temperature=20)
    Tool Response: {'status': 'success'}
    OK. It's 25°C in London, so I've set the thermostat to 20°C.

Compositional function calling is a native[Live API](https://ai.google.dev/gemini-api/docs/live)feature. This means Live API can handle the function calling similar to the Python SDK.  

### Python

    # Light control schemas
    turn_on_the_lights_schema = {'name': 'turn_on_the_lights'}
    turn_off_the_lights_schema = {'name': 'turn_off_the_lights'}

    prompt = """
      Hey, can you write run some python code to turn on the lights, wait 10s and then turn off the lights?
      """

    tools = [
        {'code_execution': {}},
        {'function_declarations': [turn_on_the_lights_schema, turn_off_the_lights_schema]}
    ]

    await run(prompt, tools=tools, modality="AUDIO")

### JavaScript

    // Light control schemas
    const turnOnTheLightsSchema = { name: 'turn_on_the_lights' };
    const turnOffTheLightsSchema = { name: 'turn_off_the_lights' };

    const prompt = `
      Hey, can you write run some python code to turn on the lights, wait 10s and then turn off the lights?
    `;

    const tools = [
      { codeExecution: {} },
      { functionDeclarations: [turnOnTheLightsSchema, turnOffTheLightsSchema] }
    ];

    await run(prompt, tools=tools, modality="AUDIO")

## Function calling modes

The Gemini API lets you control how the model uses the provided tools (function declarations). Specifically, you can set the mode within the.`function_calling_config`.

- `AUTO (Default)`: The model decides whether to generate a natural language response or suggest a function call based on the prompt and context. This is the most flexible mode and recommended for most scenarios.
- `ANY`: The model is constrained to always predict a function call and guarantees function schema adherence. If`allowed_function_names`is not specified, the model can choose from any of the provided function declarations. If`allowed_function_names`is provided as a list, the model can only choose from the functions in that list. Use this mode when you require a function call response to every prompt (if applicable).
- `NONE`: The model is*prohibited*from making function calls. This is equivalent to sending a request without any function declarations. Use this to temporarily disable function calling without removing your tool definitions.
- `VALIDATED`(Preview): The model is constrained to predict either function calls or natural language, and ensures function schema adherence. If`allowed_function_names`is not provided, the model picks from all of the available function declarations. If`allowed_function_names`is provided, the model picks from the set of allowed functions.

### Python

    from google.genai import types

    # Configure function calling mode
    tool_config = types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(
            mode="ANY", allowed_function_names=["get_current_temperature"]
        )
    )

    # Create the generation config
    config = types.GenerateContentConfig(
        tools=[tools],  # not defined here.
        tool_config=tool_config,
    )

### JavaScript

    import { FunctionCallingConfigMode } from '@google/genai';

    // Configure function calling mode
    const toolConfig = {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.ANY,
        allowedFunctionNames: ['get_current_temperature']
      }
    };

    // Create the generation config
    const config = {
      tools: tools, // not defined here.
      toolConfig: toolConfig,
    };

## Automatic function calling (Python only)

When using the Python SDK, you can provide Python functions directly as tools. The SDK converts these functions into declarations, manages the function call execution, and handles the response cycle for you. Define your function with type hints and a docstring. For optimal results, it is recommended to use[Google-style docstrings.](https://google.github.io/styleguide/pyguide.html#383-functions-and-methods)The SDK will then automatically:

1. Detect function call responses from the model.
2. Call the corresponding Python function in your code.
3. Send the function's response back to the model.
4. Return the model's final text response.

The SDK currently does not parse argument descriptions into the property description slots of the generated function declaration. Instead, it sends the entire docstring as the top-level function description.  

### Python

    from google import genai
    from google.genai import types

    # Define the function with type hints and docstring
    def get_current_temperature(location: str) -> dict:
        """Gets the current temperature for a given location.

        Args:
            location: The city and state, e.g. San Francisco, CA

        Returns:
            A dictionary containing the temperature and unit.
        """
        # ... (implementation) ...
        return {"temperature": 25, "unit": "Celsius"}

    # Configure the client
    client = genai.Client()
    config = types.GenerateContentConfig(
        tools=[get_current_temperature]
    )  # Pass the function itself

    # Make the request
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="What's the temperature in Boston?",
        config=config,
    )

    print(response.text)  # The SDK handles the function call and returns the final text

You can disable automatic function calling with:  

### Python

    config = types.GenerateContentConfig(
        tools=[get_current_temperature],
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
    )

### Automatic function schema declaration

The API is able to describe any of the following types.`Pydantic`types are allowed, as long as the fields defined on them are also composed of allowed types. Dict types (like`dict[str: int]`) are not well supported here, don't use them.  

### Python

    AllowedType = (
      int | float | bool | str | list['AllowedType'] | pydantic.BaseModel)

To see what the inferred schema looks like, you can convert it using[`from_callable`](https://googleapis.github.io/python-genai/genai.html#genai.types.FunctionDeclaration.from_callable):  

### Python

    from google import genai
    from google.genai import types

    def multiply(a: float, b: float):
        """Returns a * b."""
        return a * b

    client = genai.Client()
    fn_decl = types.FunctionDeclaration.from_callable(callable=multiply, client=client)

    # to_json_dict() provides a clean JSON representation.
    print(fn_decl.to_json_dict())

## Multi-tool use: Combine native tools with function calling

You can enable multiple tools combining native tools with function calling at the same time. Here's an example that enables two tools,[Grounding with Google Search](https://ai.google.dev/gemini-api/docs/grounding)and[code execution](https://ai.google.dev/gemini-api/docs/code-execution), in a request using the[Live API](https://ai.google.dev/gemini-api/docs/live).
**Note:** Multi-tool use is a-[Live API](https://ai.google.dev/gemini-api/docs/live)only feature at the moment. The`run()`function declaration, which handles the asynchronous websocket setup, is omitted for brevity.  

### Python

    # Multiple tasks example - combining lights, code execution, and search
    prompt = """
      Hey, I need you to do three things for me.

        1.  Turn on the lights.
        2.  Then compute the largest prime palindrome under 100000.
        3.  Then use Google Search to look up information about the largest earthquake in California the week of Dec 5 2024.

      Thanks!
      """

    tools = [
        {'google_search': {}},
        {'code_execution': {}},
        {'function_declarations': [turn_on_the_lights_schema, turn_off_the_lights_schema]} # not defined here.
    ]

    # Execute the prompt with specified tools in audio modality
    await run(prompt, tools=tools, modality="AUDIO")

### JavaScript

    // Multiple tasks example - combining lights, code execution, and search
    const prompt = `
      Hey, I need you to do three things for me.

        1.  Turn on the lights.
        2.  Then compute the largest prime palindrome under 100000.
        3.  Then use Google Search to look up information about the largest earthquake in California the week of Dec 5 2024.

      Thanks!
    `;

    const tools = [
      { googleSearch: {} },
      { codeExecution: {} },
      { functionDeclarations: [turnOnTheLightsSchema, turnOffTheLightsSchema] } // not defined here.
    ];

    // Execute the prompt with specified tools in audio modality
    await run(prompt, {tools: tools, modality: "AUDIO"});

Python developers can try this out in the[Live API Tool Use notebook](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_started_LiveAPI_tools.ipynb).

## Model context protocol (MCP)

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction)is an open standard for connecting AI applications with external tools and data. MCP provides a common protocol for models to access context, such as functions (tools), data sources (resources), or predefined prompts.

The Gemini SDKs have built-in support for the MCP, reducing boilerplate code and offering[automatic tool calling](https://ai.google.dev/gemini-api/docs/function-calling#automatic_function_calling_python_only)for MCP tools. When the model generates an MCP tool call, the Python and JavaScript client SDK can automatically execute the MCP tool and send the response back to the model in a subsequent request, continuing this loop until no more tool calls are made by the model.

Here, you can find an example of how to use a local MCP server with Gemini and`mcp`SDK.  

### Python

Make sure the latest version of the[`mcp`SDK](https://modelcontextprotocol.io/introduction)is installed on your platform of choice.  

    pip install mcp

**Note:** Python supports automatic tool calling by passing in the`ClientSession`into the`tools`parameters. If you want to disable it, you can provide`automatic_function_calling`with disabled`True`.  

    import os
    import asyncio
    from datetime import datetime
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
    from google import genai

    client = genai.Client()

    # Create server parameters for stdio connection
    server_params = StdioServerParameters(
        command="npx",  # Executable
        args=["-y", "@philschmid/weather-mcp"],  # MCP Server
        env=None,  # Optional environment variables
    )

    async def run():
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                # Prompt to get the weather for the current day in London.
                prompt = f"What is the weather in London in {datetime.now().strftime('%Y-%m-%d')}?"

                # Initialize the connection between client and server
                await session.initialize()

                # Send request to the model with MCP function declarations
                response = await client.aio.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=genai.types.GenerateContentConfig(
                        temperature=0,
                        tools=[session],  # uses the session, will automatically call the tool
                        # Uncomment if you **don't** want the SDK to automatically call the tool
                        # automatic_function_calling=genai.types.AutomaticFunctionCallingConfig(
                        #     disable=True
                        # ),
                    ),
                )
                print(response.text)

    # Start the asyncio event loop and run the main function
    asyncio.run(run())

### JavaScript

Make sure the latest version of the`mcp`SDK is installed on your platform of choice.  

    npm install @modelcontextprotocol/sdk

**Note:** JavaScript supports automatic tool calling by wrapping the`client`with`mcpToTool`. If you want to disable it, you can provide`automaticFunctionCalling`with disabled`true`.  

    import { GoogleGenAI, FunctionCallingConfigMode , mcpToTool} from '@google/genai';
    import { Client } from "@modelcontextprotocol/sdk/client/index.js";
    import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

    // Create server parameters for stdio connection
    const serverParams = new StdioClientTransport({
      command: "npx", // Executable
      args: ["-y", "@philschmid/weather-mcp"] // MCP Server
    });

    const client = new Client(
      {
        name: "example-client",
        version: "1.0.0"
      }
    );

    // Configure the client
    const ai = new GoogleGenAI({});

    // Initialize the connection between client and server
    await client.connect(serverParams);

    // Send request to the model with MCP tools
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What is the weather in London in ${new Date().toLocaleDateString()}?`,
      config: {
        tools: [mcpToTool(client)],  // uses the session, will automatically call the tool
        // Uncomment if you **don't** want the sdk to automatically call the tool
        // automaticFunctionCalling: {
        //   disable: true,
        // },
      },
    });
    console.log(response.text)

    // Close the connection
    await client.close();

### Limitations with built-in MCP support

Built-in MCP support is a[experimental](https://ai.google.dev/gemini-api/docs/models#preview)feature in our SDKs and has the following limitations:

- Only tools are supported, not resources nor prompts
- It is available for the Python and JavaScript/TypeScript SDK.
- Breaking changes might occur in future releases.

Manual integration of MCP servers is always an option if these limit what you're building.

## Supported models

This section lists models and their function calling capabilities. Experimental models are not included. You can find a comprehensive capabilities overview on the[model overview](https://ai.google.dev/gemini-api/docs/models)page.

|         Model         | Function Calling | Parallel Function Calling | Compositional Function Calling |
|-----------------------|------------------|---------------------------|--------------------------------|
| Gemini 2.5 Pro        | ✔️               | ✔️                        | ✔️                             |
| Gemini 2.5 Flash      | ✔️               | ✔️                        | ✔️                             |
| Gemini 2.5 Flash-Lite | ✔️               | ✔️                        | ✔️                             |
| Gemini 2.0 Flash      | ✔️               | ✔️                        | ✔️                             |
| Gemini 2.0 Flash-Lite | X                | X                         | X                              |

## Best practices

- **Function and Parameter Descriptions:**Be extremely clear and specific in your descriptions. The model relies on these to choose the correct function and provide appropriate arguments.
- **Naming:**Use descriptive function names (without spaces, periods, or dashes).
- **Strong Typing:**Use specific types (integer, string, enum) for parameters to reduce errors. If a parameter has a limited set of valid values, use an enum.
- **Tool Selection:**While the model can use an arbitrary number of tools, providing too many can increase the risk of selecting an incorrect or suboptimal tool. For best results, aim to provide only the relevant tools for the context or task, ideally keeping the active set to a maximum of 10-20. Consider dynamic tool selection based on conversation context if you have a large total number of tools.
- **Prompt Engineering:**
  - Provide context: Tell the model its role (e.g., "You are a helpful weather assistant.").
  - Give instructions: Specify how and when to use functions (e.g., "Don't guess dates; always use a future date for forecasts.").
  - Encourage clarification: Instruct the model to ask clarifying questions if needed.
- **Temperature:**Use a low temperature (e.g., 0) for more deterministic and reliable function calls.

  | When using Gemini 3 models, we strongly recommend keeping the`temperature`at its default value of 1.0. Changing the temperature (setting it below 1.0) may lead to unexpected behavior, such as looping or degraded performance, particularly in complex mathematical or reasoning tasks.
- **Validation:**If a function call has significant consequences (e.g., placing an order), validate the call with the user before executing it.

- **Check Finish Reason:** Always check the[`finishReason`](https://ai.google.dev/api/generate-content#FinishReason)in the model's response to handle cases where the model failed to generate a valid function call.

- **Error Handling**: Implement robust error handling in your functions to gracefully handle unexpected inputs or API failures. Return informative error messages that the model can use to generate helpful responses to the user.

- **Security:**Be mindful of security when calling external APIs. Use appropriate authentication and authorization mechanisms. Avoid exposing sensitive data in function calls.

- **Token Limits:**Function descriptions and parameters count towards your input token limit. If you're hitting token limits, consider limiting the number of functions or the length of the descriptions, break down complex tasks into smaller, more focused function sets.

## Notes and limitations

- Only a[subset of the OpenAPI schema](https://ai.google.dev/api/caching#FunctionDeclaration)is supported.
- Supported parameter types in Python are limited.
- Automatic function calling is a Python SDK feature only.


Many Gemini models come with large context windows of 1 million or more tokens.
Historically, large language models (LLMs) were significantly limited by
the amount of text (or tokens) that could be passed to the model at one time.
The Gemini long context window unlocks many new use cases and developer
paradigms.

The code you already use for cases like [text
generation](https://ai.google.dev/gemini-api/docs/text-generation) or [multimodal
inputs](https://ai.google.dev/gemini-api/docs/vision) will work without any changes with long context.

This document gives you an overview of what you can achieve using models with
context windows of 1M and more tokens. The page gives a brief overview of
a context window, and explores how developers should think about long context,
various real world use cases for long context, and ways to optimize the usage
of long context.

For the context window sizes of specific models, see the
[Models](https://ai.google.dev/gemini-api/docs/models) page.

## What is a context window?

The basic way you use the Gemini models is by passing information (context)
to the model, which will subsequently generate a response. An analogy for the
context window is short term memory. There is a limited amount of information
that can be stored in someone's short term memory, and the same is true for
generative models.

You can read more about how models work under the hood in our [generative models
guide](https://ai.google.dev/gemini-api/docs/prompting-strategies#under-the-hood).

## Getting started with long context

Earlier versions of generative models were only able to process 8,000
tokens at a time. Newer models pushed this further by accepting 32,000 or even
128,000 tokens. Gemini is the first model capable of accepting 1 million tokens.

In practice, 1 million tokens would look like:

- 50,000 lines of code (with the standard 80 characters per line)
- All the text messages you have sent in the last 5 years
- 8 average length English novels
- Transcripts of over 200 average length podcast episodes

The more limited context windows common in many other models often require
strategies like arbitrarily dropping old messages, summarizing content, using
RAG with vector databases, or filtering prompts to save tokens.

While these techniques remain valuable in specific scenarios, Gemini's extensive
context window invites a more direct approach: providing all relevant
information upfront. Because Gemini models were purpose-built with massive
context capabilities, they demonstrate powerful in-context learning. For
example, using only in-context instructional materials (a 500-page reference
grammar, a dictionary, and ≈400 parallel sentences), Gemini
[learned to translate](https://storage.googleapis.com/deepmind-media/gemini/gemini_v1_5_report.pdf)
from English to Kalamang---a Papuan language with
fewer than 200 speakers---with quality similar to a human learner using the same
materials. This illustrates the paradigm shift enabled by Gemini's long context,
empowering new possibilities through robust in-context learning.

## Long context use cases

While the standard use case for most generative models is still text input, the
Gemini model family enables a new paradigm of multimodal use cases. These
models can natively understand text, video, audio, and images. They are
accompanied by the [Gemini API that takes in multimodal file
types](https://ai.google.dev/gemini-api/docs/prompting_with_media) for
convenience.

### Long form text

Text has proved to be the layer of intelligence underpinning much of the
momentum around LLMs. As mentioned earlier, much of the practical limitation of
LLMs was because of not having a large enough context window to do certain
tasks. This led to the rapid adoption of retrieval augmented generation (RAG)
and other techniques which dynamically provide the model with relevant
contextual information. Now, with larger and larger context windows, there are
new techniques becoming available which unlock new use cases.

Some emerging and standard use cases for text based long context include:

- Summarizing large corpuses of text
  - Previous summarization options with smaller context models would require a sliding window or another technique to keep state of previous sections as new tokens are passed to the model
- Question and answering
  - Historically this was only possible with RAG given the limited amount of context and models' factual recall being low
- Agentic workflows
  - Text is the underpinning of how agents keep state of what they have done and what they need to do; not having enough information about the world and the agent's goal is a limitation on the reliability of agents

[Many-shot in-context learning](https://arxiv.org/pdf/2404.11018) is one of the
most unique capabilities unlocked by long context models. Research has shown
that taking the common "single shot" or "multi-shot" example paradigm, where the
model is presented with one or a few examples of a task, and scaling that up to
hundreds, thousands, or even hundreds of thousands of examples, can lead to
novel model capabilities. This many-shot approach has also been shown to perform
similarly to models which were fine-tuned for a specific task. For use cases
where a Gemini model's performance is not yet sufficient for a production
rollout, you can try the many-shot approach. As you might explore later in the
long context optimization section, context caching makes this type of high input
token workload much more economically feasible and even lower latency in some
cases.

### Long form video

Video content's utility has long been constrained by the lack of accessibility
of the medium itself. It was hard to skim the content, transcripts often failed
to capture the nuance of a video, and most tools don't process image, text, and
audio together. With Gemini, the long-context text capabilities translate to
the ability to reason and answer questions about multimodal inputs with
sustained performance.

Some emerging and standard use cases for video long context include:

- Video question and answering
- Video memory, as shown with [Google's Project Astra](https://deepmind.google/technologies/gemini/project-astra/)
- Video captioning
- Video recommendation systems, by enriching existing metadata with new multimodal understanding
- Video customization, by looking at a corpus of data and associated video metadata and then removing parts of videos that are not relevant to the viewer
- Video content moderation
- Real-time video processing

When working with videos, it is important to consider how the [videos are
processed into tokens](https://ai.google.dev/gemini-api/docs/tokens#media-token), which affects
billing and usage limits. You can learn more about prompting with video files in
the [Prompting
guide](https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=python#prompting-with-videos).

### Long form audio

The Gemini models were the first natively multimodal large language models
that could understand audio. Historically, the typical developer workflow would
involve stringing together multiple domain specific models, like a
speech-to-text model and a text-to-text model, in order to process audio. This
led to additional latency required by performing multiple round-trip requests
and decreased performance usually attributed to disconnected architectures of
the multiple model setup.

Some emerging and standard use cases for audio context include:

- Real-time transcription and translation
- Podcast / video question and answering
- Meeting transcription and summarization
- Voice assistants

You can learn more about prompting with audio files in the [Prompting
guide](https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=python#prompting-with-videos).

## Long context optimizations

The primary optimization when working with long context and the Gemini
models is to use [context
caching](https://ai.google.dev/gemini-api/docs/caching). Beyond the previous
impossibility of processing lots of tokens in a single request, the other main
constraint was the cost. If you have a "chat with your data" app where a user
uploads 10 PDFs, a video, and some work documents, you would historically have
to work with a more complex retrieval augmented generation (RAG) tool /
framework in order to process these requests and pay a significant amount for
tokens moved into the context window. Now, you can cache the files the user
uploads and pay to store them on a per hour basis. The input / output cost per
request with Gemini Flash for example is \~4x less than the standard
input / output cost, so if
the user chats with their data enough, it becomes a huge cost saving for you as
the developer.

## Long context limitations

In various sections of this guide, we talked about how Gemini models achieve
high performance across various needle-in-a-haystack retrieval evals. These
tests consider the most basic setup, where you have a single needle you are
looking for. In cases where you might have multiple "needles" or specific pieces
of information you are looking for, the model does not perform with the same
accuracy. Performance can vary to a wide degree depending on the context. This
is important to consider as there is an inherent tradeoff between getting the
right information retrieved and cost. You can get \~99% on a single query, but
you have to pay the input token cost every time you send that query. So for 100
pieces of information to be retrieved, if you needed 99% performance, you would
likely need to send 100 requests. This is a good example of where context
caching can significantly reduce the cost associated with using Gemini models
while keeping the performance high.

## FAQs

### Where is the best place to put my query in the context window?

In most cases, especially if the total context is long, the model's
performance will be better if you put your query / question at the end of the
prompt (after all the other context).

### Do I lose model performance when I add more tokens to a query?

Generally, if you don't need tokens to be passed to the model, it is best to
avoid passing them. However, if you have a large chunk of tokens with some
information and want to ask questions about that information, the model is
highly capable of extracting that information (up to 99% accuracy in many
cases).

### How can I lower my cost with long-context queries?

If you have a similar set of tokens / context that you want to re-use many
times, [context caching](https://ai.google.dev/gemini-api/docs/caching) can help reduce the costs
associated with asking questions about that information.

### Does the context length affect the model latency?

There is some fixed amount of latency in any given request, regardless of the
size, but generally longer queries will have higher latency (time to first
token).

<br />

Tools extend the capabilities of Gemini models, enabling them to take action in the world, access real-time information, and perform complex computational tasks. Models can use tools in both standard request-response interactions and real-time streaming sessions via the[Live API](https://ai.google.dev/gemini-api/docs/live-tools).

The Gemini API provides a suite of fully managed, built-in tools optimized for Gemini models or you can define custom tools using[Function Calling](https://ai.google.dev/gemini-api/docs/function-calling).

## Available built-in tools

|                                     Tool                                     |                                                  Description                                                  |                                                   Use Cases                                                   |
|------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| [Google Search](https://ai.google.dev/gemini-api/docs/google-search)         | Ground responses in current events and facts from the web to reduce hallucinations.                           | - Answering questions about recent events - Verifying facts with diverse sources                              |
| [Google Maps](https://ai.google.dev/gemini-api/docs/maps-grounding)          | Build location-aware assistants that can find places, get directions, and provide rich local context.         | - Planning travel itineraries with multiple stops - Finding local businesses based on user criteria           |
| [Code Execution](https://ai.google.dev/gemini-api/docs/code-execution)       | Allow the model to write and run Python code to solve math problems or process data accurately.               | - Solving complex mathematical equations - Processing and analyzing text data precisely                       |
| [URL Context](https://ai.google.dev/gemini-api/docs/url-context)             | Direct the model to read and analyze content from specific web pages or documents.                            | - Answering questions based on specific URLs or documents - Retrieving information across different web pages |
| [Computer Use (Preview)](https://ai.google.dev/gemini-api/docs/computer-use) | Enable Gemini to view a screen and generate actions to interact with web browser UIs (Client-side execution). | - Automating repetitive web-based workflows - Testing web application user interfaces                         |
| [File Search](https://ai.google.dev/gemini-api/docs/file-search)             | Index and search your own documents to enable Retrieval Augmented Generation (RAG).                           | - Searching technical manuals - Question answering over proprietary data                                      |

See the[Pricing page](https://ai.google.dev/gemini-api/docs/pricing#pricing_for_tools)for details on costs associated with specific tools.

## How tools execution works

Tools allow the model to request actions during a conversation. The flow differs depending on whether the tool is built-in (managed by Google) or custom (managed by you).

### Built-in tool flow

For built-in tools like Google Search or Code Execution, the entire process happens within one API call:

1. **You**send a prompt: "What is the square root of the latest stock price of GOOG?"
2. **Gemini**decides it needs tools and executes them on Google's servers (e.g., searches for the stock price, then runs Python code to calculate the square root).
3. **Gemini**sends back the final answer grounded in the tool results.

### Custom tool flow (Function Calling)

For custom tools and Computer Use, your application handles the execution:

1. **You**send a prompt along with functions (tools) declarations.
2. **Gemini** might send back a structured JSON to call a specific function (for example,`{"name": "get_order_status", "args": {"order_id": "123"}}`).
3. **You**execute the function in your application or environment.
4. **You**send the function results back to Gemini.
5. **Gemini**uses the results to generate a final response or another tool call.

Learn more in the[Function calling guide](https://ai.google.dev/gemini-api/docs/function-calling).

## Structured outputs vs. function Calling

Gemini offers two methods for generating structured outputs. Use[Function calling](https://ai.google.dev/gemini-api/docs/function-calling)when the model needs to perform an intermediate step by connecting to your own tools or data systems. Use[Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)when you strictly need the model's final response to adhere to a specific schema, such as for rendering a custom UI.

## Structured outputs with tools

| **Preview:** This is a feature available only with the`gemini-3-pro-preview`model.

You can combine[Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)with built-in tools to ensure that model responses grounded in external data or computation still adhere to a strict schema.

See[Structured outputs with tools](https://ai.google.dev/gemini-api/docs/structured-output?example=recipe#structured_outputs_with_tools)for code examples.

## Building agents

Agents are systems that use models and tools to complete multi-step tasks. While Gemini provides the reasoning capabilities (the "brain") and the essential tools (the "hands"), you often need an orchestration framework to manage the agent's memory, plan loops, and perform complex tool chaining.

Gemini integrates with leading open-source agent frameworks:

- [**LangChain / LangGraph**](https://ai.google.dev/gemini-api/docs/langgraph-example): Build stateful, complex application flows and multi-agent systems using graph structures.
- [**LlamaIndex**](https://ai.google.dev/gemini-api/docs/llama-index): Connect Gemini agents to your private data for RAG-enhanced workflows.
- [**CrewAI**](https://ai.google.dev/gemini-api/docs/crewai-example): Orchestrate collaborative, role-playing autonomous AI agents.
- [**Vercel AI SDK**](https://ai.google.dev/gemini-api/docs/vercel-ai-sdk-example): Build AI-powered user interfaces and agents in JavaScript/TypeScript.
- [**Google ADK**](https://google.github.io/adk-docs/get-started/python/): An open-source framework for building and orchestrating interoperable AI agents.

<br />

Grounding with Google Search connects the Gemini model to real-time web content and works with all available languages. This allows Gemini to provide more accurate answers and cite verifiable sources beyond its knowledge cutoff.

Grounding helps you build applications that can:

- **Increase factual accuracy:**Reduce model hallucinations by basing responses on real-world information.
- **Access real-time information:**Answer questions about recent events and topics.
- **Provide citations:**Build user trust by showing the sources for the model's claims.

### Python

    from google import genai
    from google.genai import types

    client = genai.Client()

    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )

    config = types.GenerateContentConfig(
        tools=[grounding_tool]
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Who won the euro 2024?",
        config=config,
    )

    print(response.text)

### JavaScript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Who won the euro 2024?",
      config,
    });

    console.log(response.text);

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H "Content-Type: application/json" \
      -X POST \
      -d '{
        "contents": [
          {
            "parts": [
              {"text": "Who won the euro 2024?"}
            ]
          }
        ],
        "tools": [
          {
            "google_search": {}
          }
        ]
      }'

You can learn more by trying the[Search tool notebook](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Search_Grounding.ipynb).

## How grounding with Google Search works

When you enable the`google_search`tool, the model handles the entire workflow of searching, processing, and citing information automatically.

![grounding-overview](https://ai.google.dev/static/gemini-api/docs/images/google-search-tool-overview.png)

1. **User Prompt:** Your application sends a user's prompt to the Gemini API with the`google_search`tool enabled.
2. **Prompt Analysis:**The model analyzes the prompt and determines if a Google Search can improve the answer.
3. **Google Search:**If needed, the model automatically generates one or multiple search queries and executes them.
4. **Search Results Processing:**The model processes the search results, synthesizes the information, and formulates a response.
5. **Grounded Response:** The API returns a final, user-friendly response that is grounded in the search results. This response includes the model's text answer and`groundingMetadata`with the search queries, web results, and citations.

## Understanding the grounding response

When a response is successfully grounded, the response includes a`groundingMetadata`field. This structured data is essential for verifying claims and building a rich citation experience in your application.  

    {
      "candidates": [
        {
          "content": {
            "parts": [
              {
                "text": "Spain won Euro 2024, defeating England 2-1 in the final. This victory marks Spain's record fourth European Championship title."
              }
            ],
            "role": "model"
          },
          "groundingMetadata": {
            "webSearchQueries": [
              "UEFA Euro 2024 winner",
              "who won euro 2024"
            ],
            "searchEntryPoint": {
              "renderedContent": "<!-- HTML and CSS for the search widget -->"
            },
            "groundingChunks": [
              {"web": {"uri": "https://vertexaisearch.cloud.google.com.....", "title": "aljazeera.com"}},
              {"web": {"uri": "https://vertexaisearch.cloud.google.com.....", "title": "uefa.com"}}
            ],
            "groundingSupports": [
              {
                "segment": {"startIndex": 0, "endIndex": 85, "text": "Spain won Euro 2024, defeatin..."},
                "groundingChunkIndices": [0]
              },
              {
                "segment": {"startIndex": 86, "endIndex": 210, "text": "This victory marks Spain's..."},
                "groundingChunkIndices": [0, 1]
              }
            ]
          }
        }
      ]
    }

The Gemini API returns the following information with the`groundingMetadata`:

- `webSearchQueries`: Array of the search queries used. This is useful for debugging and understanding the model's reasoning process.
- `searchEntryPoint`: Contains the HTML and CSS to render the required Search Suggestions. Full usage requirements are detailed in the[Terms of Service](https://ai.google.dev/gemini-api/terms#grounding-with-google-search).
- `groundingChunks`: Array of objects containing the web sources (`uri`and`title`).
- `groundingSupports`: Array of chunks to connect model response`text`to the sources in`groundingChunks`. Each chunk links a text`segment`(defined by`startIndex`and`endIndex`) to one or more`groundingChunkIndices`. This is the key to building inline citations.

Grounding with Google Search can also be used in combination with the[URL context tool](https://ai.google.dev/gemini-api/docs/url-context)to ground responses in both public web data and the specific URLs you provide.

## Attributing sources with inline citations

The API returns structured citation data, giving you complete control over how you display sources in your user interface. You can use the`groundingSupports`and`groundingChunks`fields to link the model's statements directly to their sources. Here is a common pattern for processing the metadata to create a response with inline, clickable citations.  

### Python

    def add_citations(response):
        text = response.text
        supports = response.candidates[0].grounding_metadata.grounding_supports
        chunks = response.candidates[0].grounding_metadata.grounding_chunks

        # Sort supports by end_index in descending order to avoid shifting issues when inserting.
        sorted_supports = sorted(supports, key=lambda s: s.segment.end_index, reverse=True)

        for support in sorted_supports:
            end_index = support.segment.end_index
            if support.grounding_chunk_indices:
                # Create citation string like [1](link1)[2](link2)
                citation_links = []
                for i in support.grounding_chunk_indices:
                    if i < len(chunks):
                        uri = chunks[i].web.uri
                        citation_links.append(f"[{i + 1}]({uri})")

                citation_string = ", ".join(citation_links)
                text = text[:end_index] + citation_string + text[end_index:]

        return text

    # Assuming response with grounding metadata
    text_with_citations = add_citations(response)
    print(text_with_citations)

### JavaScript

    function addCitations(response) {
        let text = response.text;
        const supports = response.candidates[0]?.groundingMetadata?.groundingSupports;
        const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;

        // Sort supports by end_index in descending order to avoid shifting issues when inserting.
        const sortedSupports = [...supports].sort(
            (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0),
        );

        for (const support of sortedSupports) {
            const endIndex = support.segment?.endIndex;
            if (endIndex === undefined || !support.groundingChunkIndices?.length) {
            continue;
            }

            const citationLinks = support.groundingChunkIndices
            .map(i => {
                const uri = chunks[i]?.web?.uri;
                if (uri) {
                return `[${i + 1}](${uri})`;
                }
                return null;
            })
            .filter(Boolean);

            if (citationLinks.length > 0) {
            const citationString = citationLinks.join(", ");
            text = text.slice(0, endIndex) + citationString + text.slice(endIndex);
            }
        }

        return text;
    }

    const textWithCitations = addCitations(response);
    console.log(textWithCitations);

The new response with inline citations will look like this:  

    Spain won Euro 2024, defeating England 2-1 in the final.[1](https:/...), [2](https:/...), [4](https:/...), [5](https:/...) This victory marks Spain's record-breaking fourth European Championship title.[5]((https:/...), [2](https:/...), [3](https:/...), [4](https:/...)

## Pricing

When you use Grounding with Google Search, your project is billed for each search query that the model decides to execute. If the model decides to execute multiple search queries to answer a single prompt (for example, searching for`"UEFA Euro 2024 winner"`and`"Spain vs England Euro 2024 final score"`within the same API call), this counts as two billable uses of the tool for that request.

For detailed pricing information, see the[Gemini API pricing page](https://ai.google.dev/gemini-api/docs/pricing).

## Supported models

Experimental and Preview models are not included. You can find their capabilities on the[model overview](https://ai.google.dev/gemini-api/docs/models)page.

|         Model         | Grounding with Google Search |
|-----------------------|------------------------------|
| Gemini 2.5 Pro        | ✔️                           |
| Gemini 2.5 Flash      | ✔️                           |
| Gemini 2.5 Flash-Lite | ✔️                           |
| Gemini 2.0 Flash      | ✔️                           |
| Gemini 1.5 Pro        | ✔️                           |
| Gemini 1.5 Flash      | ✔️                           |

| **Note:** Older models use a`google_search_retrieval`tool. For all current models, use the`google_search`tool as shown in the examples.

## Supported tools combinations

You can use Grounding with Google Search with other tools like[code execution](https://ai.google.dev/gemini-api/docs/code-execution)and[URL context](https://ai.google.dev/gemini-api/docs/url-context)to power more complex use cases.

## Grounding with Gemini 1.5 Models (Legacy)

While the`google_search`tool is recommended for Gemini 2.0 and later, Gemini 1.5 supports a legacy tool named`google_search_retrieval`. This tool provides a`dynamic`mode that allows the model to decide whether to perform a search based on its confidence that the prompt requires fresh information. If the model's confidence is above a`dynamic_threshold`you set (a value between 0.0 and 1.0), it will perform a search.  

### Python

    # Note: This is a legacy approach for Gemini 1.5 models.
    # The 'google_search' tool is recommended for all new development.
    import os
    from google import genai
    from google.genai import types

    client = genai.Client()

    retrieval_tool = types.Tool(
        google_search_retrieval=types.GoogleSearchRetrieval(
            dynamic_retrieval_config=types.DynamicRetrievalConfig(
                mode=types.DynamicRetrievalConfigMode.MODE_DYNAMIC,
                dynamic_threshold=0.7 # Only search if confidence > 70%
            )
        )
    )

    config = types.GenerateContentConfig(
        tools=[retrieval_tool]
    )

    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents="Who won the euro 2024?",
        config=config,
    )
    print(response.text)
    if not response.candidates[0].grounding_metadata:
      print("\nModel answered from its own knowledge.")

### JavaScript

    // Note: This is a legacy approach for Gemini 1.5 models.
    // The 'googleSearch' tool is recommended for all new development.
    import { GoogleGenAI, DynamicRetrievalConfigMode } from "@google/genai";

    const ai = new GoogleGenAI({});

    const retrievalTool = {
      googleSearchRetrieval: {
        dynamicRetrievalConfig: {
          mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
          dynamicThreshold: 0.7, // Only search if confidence > 70%
        },
      },
    };

    const config = {
      tools: [retrievalTool],
    };

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Who won the euro 2024?",
      config,
    });

    console.log(response.text);
    if (!response.candidates?.[0]?.groundingMetadata) {
      console.log("\nModel answered from its own knowledge.");
    }

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \

      -H "Content-Type: application/json" \
      -X POST \
      -d '{
        "contents": [
          {"parts": [{"text": "Who won the euro 2024?"}]}
        ],
        "tools": [{
          "google_search_retrieval": {
            "dynamic_retrieval_config": {
              "mode": "MODE_DYNAMIC",
              "dynamic_threshold": 0.7
            }
          }
        }]
      }'

## What's next

- Try the[Grounding with Google Search in the Gemini API Cookbook](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Search_Grounding.ipynb).
- Learn about other available tools, like[Function Calling](https://ai.google.dev/gemini-api/docs/function-calling).
- Learn how to augment prompts with specific URLs using the[URL context tool](https://ai.google.dev/gemini-api/docs/url-context).


The URL context tool lets you provide additional context to the models in the
form of URLs. By including URLs in your request, the model will access
the content from those pages (as long as it's not a URL type listed in the
[limitations section](https://ai.google.dev/gemini-api/docs/url-context#limitations)) to inform
and enhance its response.

The URL context tool is useful for tasks like the following:

- **Extract Data**: Pull specific info like prices, names, or key findings from multiple URLs.
- **Compare Documents**: Analyze multiple reports, articles, or PDFs to identify differences and track trends.
- **Synthesize \& Create Content**: Combine information from several source URLs to generate accurate summaries, blog posts, or reports.
- **Analyze Code \& Docs**: Point to a GitHub repository or technical documentation to explain code, generate setup instructions, or answer questions.

The following example shows how to compare two recipes from different websites.  

### Python

    from google import genai
    from google.genai.types import Tool, GenerateContentConfig

    client = genai.Client()
    model_id = "gemini-2.5-flash"

    tools = [
      {"url_context": {}},
    ]

    url1 = "https://www.foodnetwork.com/recipes/ina-garten/perfect-roast-chicken-recipe-1940592"
    url2 = "https://www.allrecipes.com/recipe/21151/simple-whole-roast-chicken/"

    response = client.models.generate_content(
        model=model_id,
        contents=f"Compare the ingredients and cooking times from the recipes at {url1} and {url2}",
        config=GenerateContentConfig(
            tools=tools,
        )
    )

    for each in response.candidates[0].content.parts:
        print(each.text)

    # For verification, you can inspect the metadata to see which URLs the model retrieved
    print(response.candidates[0].url_context_metadata)

### Javascript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            "Compare the ingredients and cooking times from the recipes at https://www.foodnetwork.com/recipes/ina-garten/perfect-roast-chicken-recipe-1940592 and https://www.allrecipes.com/recipe/21151/simple-whole-roast-chicken/",
        ],
        config: {
          tools: [{urlContext: {}}],
        },
      });
      console.log(response.text);

      // For verification, you can inspect the metadata to see which URLs the model retrieved
      console.log(response.candidates[0].urlContextMetadata)
    }

    await main();

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
          "contents": [
              {
                  "parts": [
                      {"text": "Compare the ingredients and cooking times from the recipes at https://www.foodnetwork.com/recipes/ina-garten/perfect-roast-chicken-recipe-1940592 and https://www.allrecipes.com/recipe/21151/simple-whole-roast-chicken/"}
                  ]
              }
          ],
          "tools": [
              {
                  "url_context": {}
              }
          ]
      }' > result.json

    cat result.json

## How it works

The URL Context tool uses a two-step retrieval process to
balance speed, cost, and access to fresh data. When you provide a URL, the tool
first attempts to fetch the content from an internal index cache. This acts as a
highly optimized cache. If a URL is not available in the index (for example, if
it's a very new page), the tool automatically falls back to do a live fetch.
This directly accesses the URL to retrieve its content in real-time.

## Combining with other tools

You can combine the URL context tool with other tools to create more powerful
workflows.

### Grounding with search

When both URL context and
[Grounding with Google Search](https://ai.google.dev/gemini-api/docs/grounding) are enabled,
the model can use its search capabilities to find
relevant information online and then use the URL context tool to get a more
in-depth understanding of the pages it finds. This approach is powerful for
prompts that require both broad searching and deep analysis of specific pages.  

### Python

    from google import genai
    from google.genai.types import Tool, GenerateContentConfig, GoogleSearch, UrlContext

    client = genai.Client()
    model_id = "gemini-2.5-flash"

    tools = [
          {"url_context": {}},
          {"google_search": {}}
      ]

    response = client.models.generate_content(
        model=model_id,
        contents="Give me three day events schedule based on <var translate="no">YOUR_URL</var>. Also let me know what needs to taken care of considering weather and commute.",
        config=GenerateContentConfig(
            tools=tools,
        )
    )

    for each in response.candidates[0].content.parts:
        print(each.text)
    # get URLs retrieved for context
    print(response.candidates[0].url_context_metadata)

### Javascript

    import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({});

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            "Give me three day events schedule based on <var translate="no">YOUR_URL</var>. Also let me know what needs to taken care of considering weather and commute.",
        ],
        config: {
          tools: [
            {urlContext: {}},
            {googleSearch: {}}
            ],
        },
      });
      console.log(response.text);
      // To get URLs retrieved for context
      console.log(response.candidates[0].urlContextMetadata)
    }

    await main();

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
          "contents": [
              {
                  "parts": [
                      {"text": "Give me three day events schedule based on <var translate="no">YOUR_URL</var>. Also let me know what needs to taken care of considering weather and commute."}
                  ]
              }
          ],
          "tools": [
              {
                  "url_context": {}
              },
              {
                  "google_search": {}
              }
          ]
      }' > result.json

    cat result.json

## Understanding the response

When the model uses the URL context tool, the response includes a
`url_context_metadata` object. This object lists the URLs the model retrieved
content from and the status of each retrieval attempt, which is useful for
verification and debugging.

The following is an example of that part of the response
(parts of the response have been omitted for brevity):  

    {
      "candidates": [
        {
          "content": {
            "parts": [
              {
                "text": "... \n"
              }
            ],
            "role": "model"
          },
          ...
          "url_context_metadata": {
            "url_metadata": [
              {
                "retrieved_url": "https://www.foodnetwork.com/recipes/ina-garten/perfect-roast-chicken-recipe-1940592",
                "url_retrieval_status": "URL_RETRIEVAL_STATUS_SUCCESS"
              },
              {
                "retrieved_url": "https://www.allrecipes.com/recipe/21151/simple-whole-roast-chicken/",
                "url_retrieval_status": "URL_RETRIEVAL_STATUS_SUCCESS"
              }
            ]
          }
        }
    }

For complete detail about this object , see the
[`UrlContextMetadata` API reference](https://ai.google.dev/api/generate-content#UrlContextMetadata).

### Safety checks

The system performs a content moderation check on the URL to confirm
they meet safety standards. If the URL you provided fails this check, you will
get an `url_retrieval_status` of `URL_RETRIEVAL_STATUS_UNSAFE`.

### Token count

The content retrieved from the URLs you specify in your prompt is counted
as part of the input tokens. You can see the token count for your prompt and
tools usage in the [`usage_metadata`](https://ai.google.dev/api/generate-content#UsageMetadata)
object of the model output. The following is an example output:  

    'usage_metadata': {
      'candidates_token_count': 45,
      'prompt_token_count': 27,
      'prompt_tokens_details': [{'modality': <MediaModality.TEXT: 'TEXT'>,
        'token_count': 27}],
      'thoughts_token_count': 31,
      'tool_use_prompt_token_count': 10309,
      'tool_use_prompt_tokens_details': [{'modality': <MediaModality.TEXT: 'TEXT'>,
        'token_count': 10309}],
      'total_token_count': 10412
      }

Price per token depends on the model used, see the
[pricing](https://ai.google.dev/gemini-api/docs/pricing) page for details.

## Supported models

- [gemini-2.5-pro](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro)
- [gemini-2.5-flash](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash)
- [gemini-2.5-flash-lite](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-lite)
- [gemini-live-2.5-flash-preview](https://ai.google.dev/gemini-api/docs/models#live-api)
- [gemini-2.0-flash-live-001](https://ai.google.dev/gemini-api/docs/models#live-api-2.0)

## Best Practices

- **Provide specific URLs**: For the best results, provide direct URLs to the content you want the model to analyze. The model will only retrieve content from the URLs you provide, not any content from nested links.
- **Check for accessibility**: Verify that the URLs you provide don't lead to pages that require a login or are behind a paywall.
- **Use the complete URL**: Provide the full URL, including the protocol (e.g., https://www.google.com instead of just google.com).

## Limitations

- **Pricing** : Content retrieved from URLs counts as input tokens. Rate limit and pricing is the based on the model used. See the [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) and [pricing](https://ai.google.dev/gemini-api/docs/pricing) pages for details.
- **Request limit**: The tool can process up to 20 URLs per request.
- **URL content size**: The maximum size for content retrieved from a single URL is 34MB.

### Supported and unsupported content types

The tool can extract content from URLs with the following content types:

- Text (text/html, application/json, text/plain, text/xml, text/css, text/javascript , text/csv, text/rtf)
- Image (image/png, image/jpeg, image/bmp, image/webp)
- PDF (application/pdf)

The following content types are **not** supported:

- Paywalled content
- YouTube videos (See [video understanding](https://ai.google.dev/gemini-api/docs/video-understanding#youtube) to learn how to process YouTube URLs)
- Google workspace files like Google docs or spreadsheets
- Video and audio files

## What's next

- Explore the [URL context cookbook](https://colab.sandbox.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Grounding.ipynb#url-context) for more examples.


<br />

The Gemini 2.5 Computer Use Preview model and tool enable you to build browser
control agents that interact with and automate tasks. Using screenshots, the
Computer Use model can "see" a computer screen, and "act" by generating specific
UI actions like mouse clicks and keyboard inputs. Similar to function calling,
you need to write the client-side application code to receive and execute the
Computer Use actions.

With Computer Use, you can build agents that:

- Automate repetitive data entry or form filling on websites.
- Perform automated testing of web applications and user flows
- Conduct research across various websites (e.g., gathering product information, prices, and reviews from ecommerce sites to inform a purchase)

The easiest way to test the Gemini Computer Use model is through the [reference
implementation](https://github.com/google/computer-use-preview/) or
[Browserbase demo environment](http://gemini.browserbase.com).
| **Note:** As a Preview model, the Gemini 2.5 Computer Use model may be prone to errors and security vulnerabilities. We recommend supervising closely for important tasks, and that you avoid using the Computer Use model for tasks involving critical decisions, sensitive data, or actions where serious errors cannot be corrected. We encourage you to review the [Safety best
| practices](https://ai.google.dev/gemini-api/docs/computer-use#safety-best-practices), the [Prohibited Use
| Policy](https://policies.google.com/terms/generative-ai/use-policy) and [Gemini
| API Additional Terms of Service](https://ai.google.dev/terms).

## How Computer Use works

To build a browser control agent with the Computer Use model, implement
an agent loop that does the following:

1. [**Send a request to the model**](https://ai.google.dev/gemini-api/docs/computer-use#send-request)

   - Add the Computer Use tool and optionally any custom user-defined functions or excluded functions to your API request.
   - Prompt the Computer Use model with the user's request.
2. [**Receive the model response**](https://ai.google.dev/gemini-api/docs/computer-use#model-response)

   - The Computer Use model analyzes the user request and screenshot, and generates a response which includes a suggested `function_call` representing a UI action (e.g., "click at coordinate (x,y)" or "type 'text'"). For a description of all UI actions supported by the Computer Use model, see [Supported actions](https://ai.google.dev/gemini-api/docs/computer-use#supported-actions).
   - The API response may also include a `safety_decision` from an internal safety system that checks the model's proposed action. This `safety_decision` classifies the action as:
     - **Regular / allowed:** The action is considered safe. This may also be represented by no `safety_decision` being present.
     - **Requires confirmation (`require_confirmation`):** The model is about to perform an action that may be risky (e.g., clicking on an "accept cookie banner").
3. [**Execute the received action**](https://ai.google.dev/gemini-api/docs/computer-use#execute-actions)

   - Your client-side code receives the `function_call` and any accompanying `safety_decision`.
     - **Regular / allowed:** If the `safety_decision` indicates regular / allowed (or if no `safety_decision` is present), your client-side code can execute the specified `function_call` in your target environment (e.g., a web browser).
     - **Requires confirmation:** If the `safety_decision` indicates requires confirmation, your application must prompt the end-user for confirmation before executing the `function_call`. If the user confirms, proceed to execute the action. If the user denies, don't execute the action.
4. [**Capture the new environment state**](https://ai.google.dev/gemini-api/docs/computer-use#capture-state)

   - If the action has been executed, your client captures a new screenshot of the GUI and the current URL to send back to the Computer Use model as part of a `function_response`.
   - If an action was blocked by the safety system or denied confirmation by the user, your application might send a different form of feedback to the model or end the interaction.

This process repeats from step 2 with the Computer Use model using the new
screenshot and the ongoing goal to suggest the next action. The loop continues
until the task is completed, an error occurs, or the process is terminated
(e.g., due to a "block" safety response or user decision).

![Computer Use
overview](https://ai.google.dev/static/gemini-api/docs/images/computer_use.png)

## How to implement Computer Use

Before building with the Computer Use model and tool you will need to set up the
following:

- **Secure execution environment:** For safety reasons, you should run your Computer Use agent in a secure and controlled environment (e.g., a sandboxed virtual machine, a container, or a dedicated browser profile with limited permissions).
- **Client-side action handler:** You will need to implement client-side logic to execute the actions generated by the model and capture screenshots of the environment after each action.

The examples in this section use a browser as the execution environment
and [Playwright](https://playwright.dev/) as the client-side action handler. To
run these samples you must install the necessary dependencies and initialize a
Playwright browser instance.  

#### Install Playwright

<br />

```
    pip install google-genai playwright
    playwright install chromium
    
```  

#### Initialize Playwright browser instance

<br />

```
    from playwright.sync_api import sync_playwright

    # 1. Configure screen dimensions for the target environment
    SCREEN_WIDTH = 1440
    SCREEN_HEIGHT = 900

    # 2. Start the Playwright browser
    # In production, utilize a sandboxed environment.
    playwright = sync_playwright().start()
    # Set headless=False to see the actions performed on your screen
    browser = playwright.chromium.launch(headless=False)

    # 3. Create a context and page with the specified dimensions
    context = browser.new_context(
        viewport={"width": SCREEN_WIDTH, "height": SCREEN_HEIGHT}
    )
    page = context.new_page()

    # 4. Navigate to an initial page to start the task
    page.goto("https://www.google.com")

    # The 'page', 'SCREEN_WIDTH', and 'SCREEN_HEIGHT' variables
    # will be used in the steps below.
    
```

Sample code for extending to an Android
environment is included in the [Using custom user-defined
functions](https://ai.google.dev/gemini-api/docs/computer-use#custom-functions) section.

### 1. Send a request to the model

Add the Computer Use tool to your API request and send a prompt to the Computer
Use model that includes the user's goal.
You must use the Gemini Computer Use model,
`gemini-2.5-computer-use-preview-10-2025`. If you try to use the Computer Use
tool with a different model, you will get an error.

You can also optionally add the following parameters:

- **Excluded actions:** If there are any actions from the list of [Supported
  UI actions](https://ai.google.dev/gemini-api/docs/computer-use#supported-actions) that you don't want the model to take, specify these actions as `excluded_predefined_functions`.
- **User-defined functions:** In addition to the Computer Use tool, you may want to include custom user-defined functions.

Note that there is no need to specify the display size when issuing a request;
the model predicts pixel coordinates scaled to the height and width of the
screen.  

### Python

    from google import genai
    from google.genai import types
    from google.genai.types import Content, Part

    client = genai.Client()

    # Specify predefined functions to exclude (optional)
    excluded_functions = ["drag_and_drop"]

    generate_content_config = genai.types.GenerateContentConfig(
        tools=[
            # 1. Computer Use tool with browser environment
            types.Tool(
                computer_use=types.ComputerUse(
                    environment=types.Environment.ENVIRONMENT_BROWSER,
                    # Optional: Exclude specific predefined functions
                    excluded_predefined_functions=excluded_functions
                    )
                  ),
            # 2. Optional: Custom user-defined functions
            #types.Tool(
              # function_declarations=custom_functions
              #   )
              ],
      )

    # Create the content with user message
    contents=[
        Content(
            role="user",
            parts=[
                Part(text="Search for highly rated smart fridges with touchscreen, 2 doors, around 25 cu ft, priced below 4000 dollars on Google Shopping. Create a bulleted list of the 3 cheapest options in the format of name, description, price in an easy-to-read layout."),
            ],
        )
    ]

    # Generate content with the configured settings
    response = client.models.generate_content(
        model='gemini-2.5-computer-use-preview-10-2025',
        contents=contents,
        config=generate_content_config,
    )

    # Print the response output
    print(response)

For an example with custom functions, see [Using custom
user-defined functions](https://ai.google.dev/gemini-api/docs/computer-use#custom-functions).

### 2. Receive the model response

The Computer Use model will respond with one or more `FunctionCalls` if it
determines UI actions are needed to complete the task. Computer Use supports
parallel function calling, meaning the model can return multiple actions in a
single turn.

Here is an example model response.  

    {
      "content": {
        "parts": [
          {
            "text": "I will type the search query into the search bar. The search bar is in the center of the page."
          },
          {
            "function_call": {
              "name": "type_text_at",
              "args": {
                "x": 371,
                "y": 470,
                "text": "highly rated smart fridges with touchscreen, 2 doors, around 25 cu ft, priced below 4000 dollars on Google Shopping",
                "press_enter": true
              }
            }
          }
        ]
      }
    }

### 3. Execute the received actions

Your application code needs to parse the model response, execute the actions,
and collect the results.

The example code below extracts function calls from the Computer Use model
response, and translates them into actions that can be executed with Playwright.
The model outputs normalized coordinates (0-999) regardless of the input image
dimensions, so part of the translation step is converting these normalized
coordinates back to actual pixel values.

The recommended screen size for use
with the Computer Use model is (1440, 900). The model will work with any
resolution, though the quality of the results may be impacted.

Note that this example only includes the implementation for the 3 most common
UI actions: `open_web_browser`, `click_at`, and `type_text_at`. For
production use cases, you will need to implement all other UI actions from the
[Supported actions](https://ai.google.dev/gemini-api/docs/computer-use#supported-actions) list unless you explicitly add them as
`excluded_predefined_functions`.  

### Python

    from typing import Any, List, Tuple
    import time

    def denormalize_x(x: int, screen_width: int) -> int:
        """Convert normalized x coordinate (0-1000) to actual pixel coordinate."""
        return int(x / 1000 * screen_width)

    def denormalize_y(y: int, screen_height: int) -> int:
        """Convert normalized y coordinate (0-1000) to actual pixel coordinate."""
        return int(y / 1000 * screen_height)

    def execute_function_calls(candidate, page, screen_width, screen_height):
        results = []
        function_calls = []
        for part in candidate.content.parts:
            if part.function_call:
                function_calls.append(part.function_call)

        for function_call in function_calls:
            action_result = {}
            fname = function_call.name
            args = function_call.args
            print(f"  -> Executing: {fname}")

            try:
                if fname == "open_web_browser":
                    pass # Already open
                elif fname == "click_at":
                    actual_x = denormalize_x(args["x"], screen_width)
                    actual_y = denormalize_y(args["y"], screen_height)
                    page.mouse.click(actual_x, actual_y)
                elif fname == "type_text_at":
                    actual_x = denormalize_x(args["x"], screen_width)
                    actual_y = denormalize_y(args["y"], screen_height)
                    text = args["text"]
                    press_enter = args.get("press_enter", False)

                    page.mouse.click(actual_x, actual_y)
                    # Simple clear (Command+A, Backspace for Mac)
                    page.keyboard.press("Meta+A")
                    page.keyboard.press("Backspace")
                    page.keyboard.type(text)
                    if press_enter:
                        page.keyboard.press("Enter")
                else:
                    print(f"Warning: Unimplemented or custom function {fname}")

                # Wait for potential navigations/renders
                page.wait_for_load_state(timeout=5000)
                time.sleep(1)

            except Exception as e:
                print(f"Error executing {fname}: {e}")
                action_result = {"error": str(e)}

            results.append((fname, action_result))

        return results

### 4. Capture the new environment state

After executing the actions, send the result of the function execution back to
the model so it can use this information to generate the next action. If
multiple actions (parallel calls) were executed, you must send a
`FunctionResponse` for each one in the subsequent user turn.  

### Python


    def get_function_responses(page, results):
        screenshot_bytes = page.screenshot(type="png")
        current_url = page.url
        function_responses = []
        for name, result in results:
            response_data = {"url": current_url}
            response_data.update(result)
            function_responses.append(
                types.FunctionResponse(
                    name=name,
                    response=response_data,
                    parts=[types.FunctionResponsePart(
                            inline_data=types.FunctionResponseBlob(
                                mime_type="image/png",
                                data=screenshot_bytes))
                    ]
                )
            )
        return function_responses

## Build an agent loop

To enable multi-step interactions, combine the four steps from the [How to
implement Computer Use](https://ai.google.dev/gemini-api/docs/computer-use#implement-computer-use) section into a loop.
Remember to manage the conversation history correctly by appending both model
responses and your function responses.

To run this code sample you need to:

- Install the [necessary Playwright
  dependencies](https://ai.google.dev/gemini-api/docs/computer-use#expandable-1).
- Define the helper functions from steps [(3) Execute the received
  actions](https://ai.google.dev/gemini-api/docs/computer-use#execute-actions) and [(4) Capture the new environment
  state](https://ai.google.dev/gemini-api/docs/computer-use#capture-state).

### Python


    import time
    from typing import Any, List, Tuple
    from playwright.sync_api import sync_playwright

    from google import genai
    from google.genai import types
    from google.genai.types import Content, Part

    client = genai.Client()

    # Constants for screen dimensions
    SCREEN_WIDTH = 1440
    SCREEN_HEIGHT = 900

    # Setup Playwright
    print("Initializing browser...")
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(viewport={"width": SCREEN_WIDTH, "height": SCREEN_HEIGHT})
    page = context.new_page()

    # Define helper functions. Copy/paste from steps 3 and 4
    # def denormalize_x(...)
    # def denormalize_y(...)
    # def execute_function_calls(...)
    # def get_function_responses(...)

    try:
        # Go to initial page
        page.goto("https://ai.google.dev/gemini-api/docs")

        # Configure the model (From Step 1)
        config = types.GenerateContentConfig(
            tools=[types.Tool(computer_use=types.ComputerUse(
                environment=types.Environment.ENVIRONMENT_BROWSER
            ))],
            thinking_config=types.ThinkingConfig(include_thoughts=True),
        )

        # Initialize history
        initial_screenshot = page.screenshot(type="png")
        USER_PROMPT = "Go to ai.google.dev/gemini-api/docs and search for pricing."
        print(f"Goal: {USER_PROMPT}")

        contents = [
            Content(role="user", parts=[
                Part(text=USER_PROMPT),
                Part.from_bytes(data=initial_screenshot, mime_type='image/png')
            ])
        ]

        # Agent Loop
        turn_limit = 5
        for i in range(turn_limit):
            print(f"\n--- Turn {i+1} ---")
            print("Thinking...")
            response = client.models.generate_content(
                model='gemini-2.5-computer-use-preview-10-2025',
                contents=contents,
                config=config,
            )

            candidate = response.candidates[0]
            contents.append(candidate.content)

            has_function_calls = any(part.function_call for part in candidate.content.parts)
            if not has_function_calls:
                text_response = " ".join([part.text for part in candidate.content.parts if part.text])
                print("Agent finished:", text_response)
                break

            print("Executing actions...")
            results = execute_function_calls(candidate, page, SCREEN_WIDTH, SCREEN_HEIGHT)

            print("Capturing state...")
            function_responses = get_function_responses(page, results)

            contents.append(
                Content(role="user", parts=[Part(function_response=fr) for fr in function_responses])
            )

    finally:
        # Cleanup
        print("\nClosing browser...")
        browser.close()
        playwright.stop()

## Using custom user-defined functions

You can optionally include custom user-defined functions in your request to
extend the functionality of the model. The example below adapts the Computer Use
model and tool for mobile use cases by including custom user-defined actions
like `open_app`, `long_press_at`, and `go_home`, while excluding
browser-specific actions. The model can intelligently call these custom
functions alongside standard UI actions to complete tasks in non-browser
environments.  

### Python

    from typing import Optional, Dict, Any

    from google import genai
    from google.genai import types
    from google.genai.types import Content, Part

    client = genai.Client()

    SYSTEM_PROMPT = """You are operating an Android phone. Today's date is October 15, 2023, so ignore any other date provided.
    * To provide an answer to the user, *do not use any tools* and output your answer on a separate line. IMPORTANT: Do not add any formatting or additional punctuation/text, just output the answer by itself after two empty lines.
    * Make sure you scroll down to see everything before deciding something isn't available.
    * You can open an app from anywhere. The icon doesn't have to currently be on screen.
    * Unless explicitly told otherwise, make sure to save any changes you make.
    * If text is cut off or incomplete, scroll or click into the element to get the full text before providing an answer.
    * IMPORTANT: Complete the given task EXACTLY as stated. DO NOT make any assumptions that completing a similar task is correct.  If you can't find what you're looking for, SCROLL to find it.
    * If you want to edit some text, ONLY USE THE `type` tool. Do not use the onscreen keyboard.
    * Quick settings shouldn't be used to change settings. Use the Settings app instead.
    * The given task may already be completed. If so, there is no need to do anything.
    """

    def open_app(app_name: str, intent: Optional[str] = None) -> Dict[str, Any]:
        """Opens an app by name.

        Args:
            app_name: Name of the app to open (any string).
            intent: Optional deep-link or action to pass when launching, if the app supports it.

        Returns:
            JSON payload acknowledging the request (app name and optional intent).
        """
        return {"status": "requested_open", "app_name": app_name, "intent": intent}

    def long_press_at(x: int, y: int) -> Dict[str, int]:
        """Long-press at a specific screen coordinate.

        Args:
            x: X coordinate (absolute), scaled to the device screen width (pixels).
            y: Y coordinate (absolute), scaled to the device screen height (pixels).

        Returns:
            Object with the coordinates pressed and the duration used.
        """
        return {"x": x, "y": y}

    def go_home() -> Dict[str, str]:
        """Navigates to the device home screen.

        Returns:
            A small acknowledgment payload.
        """
        return {"status": "home_requested"}

    #  Build function declarations
    CUSTOM_FUNCTION_DECLARATIONS = [
        types.FunctionDeclaration.from_callable(client=client, callable=open_app),
        types.FunctionDeclaration.from_callable(client=client, callable=long_press_at),
        types.FunctionDeclaration.from_callable(client=client, callable=go_home),
    ]

    #Exclude browser functions
    EXCLUDED_PREDEFINED_FUNCTIONS = [
        "open_web_browser",
        "search",
        "navigate",
        "hover_at",
        "scroll_document",
        "go_forward",
        "key_combination",
        "drag_and_drop",
    ]

    #Utility function to construct a GenerateContentConfig
    def make_generate_content_config() -> genai.types.GenerateContentConfig:
        """Return a fixed GenerateContentConfig with Computer Use + custom functions."""
        return genai.types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=[
                types.Tool(
                    computer_use=types.ComputerUse(
                        environment=types.Environment.ENVIRONMENT_BROWSER,
                        excluded_predefined_functions=EXCLUDED_PREDEFINED_FUNCTIONS,
                    )
                ),
                types.Tool(function_declarations=CUSTOM_FUNCTION_DECLARATIONS),
            ],
        )

    # Create the content with user message
    contents: list[Content] = [
        Content(
            role="user",
            parts=[
                # text instruction
                Part(text="Open Chrome, then long-press at 200,400."),
            ],
        )
    ]

    # Build your fixed config (from helper)
    config = make_generate_content_config()

    # Generate content with the configured settings
    response = client.models.generate_content(
            model='gemini-2.5-computer-use-preview-10-2025',
            contents=contents,
            config=config,
        )

    print(response)

## Supported UI actions

The Computer Use model can request the following UI actions via a
`FunctionCall`. Your client-side code must implement the execution logic for
these actions. See the [reference
implementation](https://github.com/google/computer-use-preview) for
examples.

|     Command Name     |                                                                                    Description                                                                                    |                                                            Arguments (in Function Call)                                                             |                                         Example Function Call                                          |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| **open_web_browser** | Opens the web browser.                                                                                                                                                            | None                                                                                                                                                | `{"name": "open_web_browser", "args": {}}`                                                             |
| **wait_5_seconds**   | Pauses execution for 5 seconds to allow dynamic content to load or animations to complete.                                                                                        | None                                                                                                                                                | `{"name": "wait_5_seconds", "args": {}}`                                                               |
| **go_back**          | Navigates to the previous page in the browser's history.                                                                                                                          | None                                                                                                                                                | `{"name": "go_back", "args": {}}`                                                                      |
| **go_forward**       | Navigates to the next page in the browser's history.                                                                                                                              | None                                                                                                                                                | `{"name": "go_forward", "args": {}}`                                                                   |
| **search**           | Navigates to the default search engine's homepage (e.g., Google). Useful for starting a new search task.                                                                          | None                                                                                                                                                | `{"name": "search", "args": {}}`                                                                       |
| **navigate**         | Navigates the browser directly to the specified URL.                                                                                                                              | `url`: str                                                                                                                                          | `{"name": "navigate", "args": {"url": "https://www.wikipedia.org"}}`                                   |
| **click_at**         | Clicks at a specific coordinate on the webpage. The x and y values are based on a 1000x1000 grid and are scaled to the screen dimensions.                                         | `y`: int (0-999), `x`: int (0-999)                                                                                                                  | `{"name": "click_at", "args": {"y": 300, "x": 500}}`                                                   |
| **hover_at**         | Hovers the mouse at a specific coordinate on the webpage. Useful for revealing sub-menus. x and y are based on a 1000x1000 grid.                                                  | `y`: int (0-999) `x`: int (0-999)                                                                                                                   | `{"name": "hover_at", "args": {"y": 150, "x": 250}}`                                                   |
| **type_text_at**     | Types text at a specific coordinate, defaults to clearing the field first and pressing ENTER after typing, but these can be disabled. x and y are based on a 1000x1000 grid.      | `y`: int (0-999), `x`: int (0-999), `text`: str, `press_enter`: bool (Optional, default True), `clear_before_typing`: bool (Optional, default True) | `{"name": "type_text_at", "args": {"y": 250, "x": 400, "text": "search query", "press_enter": false}}` |
| **key_combination**  | Press keyboard keys or combinations, such as "Control+C" or "Enter". Useful for triggering actions (like submitting a form with "Enter") or clipboard operations.                 | `keys`: str (e.g. 'enter', 'control+c').                                                                                                            | `{"name": "key_combination", "args": {"keys": "Control+A"}}`                                           |
| **scroll_document**  | Scrolls the entire webpage "up", "down", "left", or "right".                                                                                                                      | `direction`: str ("up", "down", "left", or "right")                                                                                                 | `{"name": "scroll_document", "args": {"direction": "down"}}`                                           |
| **scroll_at**        | Scrolls a specific element or area at coordinate (x, y) in the specified direction by a certain magnitude. Coordinates and magnitude (default 800) are based on a 1000x1000 grid. | `y`: int (0-999), `x`: int (0-999), `direction`: str ("up", "down", "left", "right"), `magnitude`: int (0-999, Optional, default 800)               | `{"name": "scroll_at", "args": {"y": 500, "x": 500, "direction": "down", "magnitude": 400}}`           |
| **drag_and_drop**    | Drags an element from a starting coordinate (x, y) and drops it at a destination coordinate (destination_x, destination_y). All coordinates are based on a 1000x1000 grid.        | `y`: int (0-999), `x`: int (0-999), `destination_y`: int (0-999), `destination_x`: int (0-999)                                                      | `{"name": "drag_and_drop", "args": {"y": 100, "x": 100, "destination_y": 500, "destination_x": 500}}`  |

## Safety and security

### Acknowledge safety decision

Depending on the action, the model response might also include a
`safety_decision` from an internal safety system that checks the model's
proposed action.  

    {
      "content": {
        "parts": [
          {
            "text": "I have evaluated step 2. It seems Google detected unusual traffic and is asking me to verify I'm not a robot. I need to click the 'I'm not a robot' checkbox located near the top left (y=98, x=95).",
          },
          {
            "function_call": {
              "name": "click_at",
              "args": {
                "x": 60,
                "y": 100,
                "safety_decision": {
                  "explanation": "I have encountered a CAPTCHA challenge that requires interaction. I need you to complete the challenge by clicking the 'I'm not a robot' checkbox and any subsequent verification steps.",
                  "decision": "require_confirmation"
                }
              }
            }
          }
        ]
      }
    }

If the `safety_decision` is `require_confirmation`, you must
ask the end user to confirm before proceeding with executing the action. Per the
[terms of service](https://ai.google.dev/gemini-api/terms), you are not allowed
to bypass requests for human confirmation.

This code sample prompts the end-user for confirmation before executing the
action. If the user does not confirm the action, the loop terminates. If the
user confirms the action, the action is executed and the
`safety_acknowledgement` field is marked as `True`.  

### Python

    import termcolor

    def get_safety_confirmation(safety_decision):
        """Prompt user for confirmation when safety check is triggered."""
        termcolor.cprint("Safety service requires explicit confirmation!", color="red")
        print(safety_decision["explanation"])

        decision = ""
        while decision.lower() not in ("y", "n", "ye", "yes", "no"):
            decision = input("Do you wish to proceed? [Y]es/[N]o\n")

        if decision.lower() in ("n", "no"):
            return "TERMINATE"
        return "CONTINUE"

    def execute_function_calls(candidate, page, screen_width, screen_height):

        # ... Extract function calls from response ...

        for function_call in function_calls:
            extra_fr_fields = {}

            # Check for safety decision
            if 'safety_decision' in function_call.args:
                decision = get_safety_confirmation(function_call.args['safety_decision'])
                if decision == "TERMINATE":
                    print("Terminating agent loop")
                    break
                extra_fr_fields["safety_acknowledgement"] = "true" # Safety acknowledgement

            # ... Execute function call and append to results ...

If the user confirms, you must include the safety acknowledgement in
your `FunctionResponse`.  

### Python

    function_response_parts.append(
        FunctionResponse(
            name=name,
            response={"url": current_url,
                      **extra_fr_fields},  # Include safety acknowledgement
            parts=[
                types.FunctionResponsePart(
                    inline_data=types.FunctionResponseBlob(
                        mime_type="image/png", data=screenshot
                    )
                 )
               ]
             )
           )

### Safety best practices

Computer Use API is a novel API and presents new risks that developers should be
mindful of:

- **Untrusted content \& scams:** As the model tries to achieve the user's goal, it may rely on untrustworthy sources of information and instructions from the screen. For example, if the user's goal is to purchase a Pixel phone and the model encounters a "Free-Pixel if you complete a survey" scam, there is some chance that the model will complete the survey.
- **Occasional unintended actions:** The model can misinterpret a user's goal or webpage content, causing it to take incorrect actions like clicking the wrong button or filling the wrong form. This can lead to failed tasks or data exfiltration.
- **Policy violations:** The API's capabilities could be directed, either intentionally or unintentionally, toward activities that violate Google's policies ([Gen AI Prohibited Use
  Policy](https://policies.google.com/terms/generative-ai/use-policy) and the [Gemini API Additional Terms of
  Service](https://ai.google.dev/gemini-api/terms). This includes actions that could interfere with a system's integrity, compromise security, bypass security measures, control medical devices, etc.

To address these risks, you can implement the following safety measures and best
practices:

1. **Human-in-the-Loop (HITL):**

   - **Implement user confirmation:** When the safety response indicates `require_confirmation`, you must implement user confirmation before execution. See [Acknowledge safety decision](https://ai.google.dev/gemini-api/docs/computer-use#safety-decisions) for sample code.
   - **Provide custom safety instructions:** In addition to the built-in user
     confirmation checks, developers may optionally add a custom [system
     instruction](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions)
     that enforces their own safety policies, either to block certain model
     actions or require user confirmation before the model takes certain
     high-stakes irreversible actions. Here is an example of a custom safety
     system instruction you may include when interacting with the model.

     #### Example safety instructions

     Set your custom safety rules as a system instruction:  

     ```
         ## **RULE 1: Seek User Confirmation (USER_CONFIRMATION)**

         This is your first and most important check. If the next required action falls
         into any of the following categories, you MUST stop immediately, and seek the
         user's explicit permission.

         **Procedure for Seeking Confirmation:**  * **For Consequential Actions:**
         Perform all preparatory steps (e.g., navigating, filling out forms, typing a
         message). You will ask for confirmation **AFTER** all necessary information is
         entered on the screen, but **BEFORE** you perform the final, irreversible action
         (e.g., before clicking "Send", "Submit", "Confirm Purchase", "Share").  * **For
         Prohibited Actions:** If the action is strictly forbidden (e.g., accepting legal
         terms, solving a CAPTCHA), you must first inform the user about the required
         action and ask for their confirmation to proceed.

         **USER_CONFIRMATION Categories:**

         *   **Consent and Agreements:** You are FORBIDDEN from accepting, selecting, or
             agreeing to any of the following on the user's behalf. You must ask the
             user to confirm before performing these actions.
             *   Terms of Service
             *   Privacy Policies
             *   Cookie consent banners
             *   End User License Agreements (EULAs)
             *   Any other legally significant contracts or agreements.
         *   **Robot Detection:** You MUST NEVER attempt to solve or bypass the
             following. You must ask the user to confirm before performing these actions.
         *   CAPTCHAs (of any kind)
             *   Any other anti-robot or human-verification mechanisms, even if you are
                 capable.
         *   **Financial Transactions:**
             *   Completing any purchase.
             *   Managing or moving money (e.g., transfers, payments).
             *   Purchasing regulated goods or participating in gambling.
         *   **Sending Communications:**
             *   Sending emails.
             *   Sending messages on any platform (e.g., social media, chat apps).
             *   Posting content on social media or forums.
         *   **Accessing or Modifying Sensitive Information:**
             *   Health, financial, or government records (e.g., medical history, tax
                 forms, passport status).
             *   Revealing or modifying sensitive personal identifiers (e.g., SSN, bank
                 account number, credit card number).
         *   **User Data Management:**
             *   Accessing, downloading, or saving files from the web.
             *   Sharing or sending files/data to any third party.
             *   Transferring user data between systems.
         *   **Browser Data Usage:**
             *   Accessing or managing Chrome browsing history, bookmarks, autofill data,
                 or saved passwords.
         *   **Security and Identity:**
             *   Logging into any user account.
             *   Any action that involves misrepresentation or impersonation (e.g.,
                 creating a fan account, posting as someone else).
         *   **Insurmountable Obstacles:** If you are technically unable to interact with
             a user interface element or are stuck in a loop you cannot resolve, ask the
             user to take over.
         ---

         ## **RULE 2: Default Behavior (ACTUATE)**

         If an action does **NOT** fall under the conditions for `USER_CONFIRMATION`,
         your default behavior is to **Actuate**.

         **Actuation Means:**  You MUST proactively perform all necessary steps to move
         the user's request forward. Continue to actuate until you either complete the
         non-consequential task or encounter a condition defined in Rule 1.

         *   **Example 1:** If asked to send money, you will navigate to the payment
             portal, enter the recipient's details, and enter the amount. You will then
             **STOP** as per Rule 1 and ask for confirmation before clicking the final
             "Send" button.
         *   **Example 2:** If asked to post a message, you will navigate to the site,
             open the post composition window, and write the full message. You will then
             **STOP** as per Rule 1 and ask for confirmation before clicking the final
             "Post" button.

             After the user has confirmed, remember to get the user's latest screen
             before continuing to perform actions.

         # Final Response Guidelines:
         Write final response to the user in the following cases:
         - User confirmation
         - When the task is complete or you have enough information to respond to the user
         
     ```
2. **Secure execution environment:** Run your agent in a secure, sandboxed
   environment to limit its potential impact (e.g., A sandboxed virtual machine
   (VM), a container (e.g., Docker), or a dedicated browser profile with limited
   permissions).

3. **Input sanitization:** Sanitize all user-generated text in prompts to
   mitigate the risk of unintended instructions or prompt injection. This is a
   helpful layer of security, but not a replacement for a secure execution
   environment.

4. **Content guardrails:** Use guardrails and [content safety
   APIs](https://ai.google.dev/gemma/docs/shieldgemma) to evaluate user inputs,
   tool input and output, an agent's response for appropriateness, prompt
   injection, and jailbreak detection.

5. **Allowlists and blocklists:** Implement filtering mechanisms to control
   where the model can navigate and what it can do. A blocklist of prohibited
   websites is a good starting point, while a more restrictive allowlist is
   even more secure.

6. **Observability and logging:** Maintain detailed logs for debugging,
   auditing, and incident response. Your client should log prompts,
   screenshots, model-suggested actions (function_call), safety responses, and
   all actions ultimately executed by the client.

7. **Environment management:** Ensure the GUI environment is consistent.
   Unexpected pop-ups, notifications, or changes in layout can confuse the
   model. Start from a known, clean state for each new task if possible.

## Model versions

|                                            Property                                             |                                                                                 Description                                                                                  |
|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id_cardModel code                                                                               | **Gemini API** `gemini-2.5-computer-use-preview-10-2025`                                                                                                                     |
| saveSupported data types                                                                        | **Input** Image, text **Output** Text                                                                                                                                        |
| token_autoToken limits^[\[\*\]](https://ai.google.dev/gemini-api/docs/computer-use#token-size)^ | **Input token limit** 128,000 **Output token limit** 64,000                                                                                                                  |
| 123Versions                                                                                     | Read the [model version patterns](https://ai.google.dev/gemini-api/docs/models/gemini#model-versions) for more details. - Preview: `gemini-2.5-computer-use-preview-10-2025` |
| calendar_monthLatest update                                                                     | October 2025                                                                                                                                                                 |

## What's next

- Experiment with Computer Use in the [Browserbase demo
  environment](http://gemini.browserbase.com).
- Check out the [Reference
  implementation](https://github.com/google/computer-use-preview) for example code.
- Learn about other Gemini API tools:
  - [Function calling](https://ai.google.dev/gemini-api/docs/function-calling)
  - [Grounding with Google Search](https://ai.google.dev/gemini-api/docs/grounding)


<br />

The Gemini API enables Retrieval Augmented Generation ("RAG") through the File Search tool. File Search imports, chunks, and indexes your data to enable fast retrieval of relevant information based on a user's prompt. This information is then provided as context to the model, allowing the model to provide more accurate and relevant answers.

You can use the[`uploadToFileSearchStore`](https://ai.google.dev/api/file-search/file-search-stores#method:-media.uploadtofilesearchstore)API to directly upload an existing file to your File Search store, or separately upload and then[`importFile`](https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.importfile)if you want to create the file at the same time.

## Directly upload to File Search store

This examples shows how to directly upload a file to a file store:  

### Python

    from google import genai
    from google.genai import types
    import time

    client = genai.Client()

    # Create the File Search store with an optional display name
    file_search_store = client.file_search_stores.create(config={'display_name': 'your-fileSearchStore-name'})

    # Upload and import a file into the File Search store, supply a file name which will be visible in citations
    operation = client.file_search_stores.upload_to_file_search_store(
      file='sample.txt',
      file_search_store_name=file_search_store.name,
      config={
          'display_name' : 'display-file-name',
      }
    )

    # Wait until import is complete
    while not operation.done:
        time.sleep(5)
        operation = client.operations.get(operation)

    # Ask a question about the file
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="""Can you tell me about Robert Graves""",
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[file_search_store.name]
                    )
                )
            ]
        )
    )

    print(response.text)

### JavaScript

    const { GoogleGenAI } = require('@google/genai');

    const ai = new GoogleGenAI({});

    async function run() {
      // Create the File Search store with an optional display name
      const fileSearchStore = await ai.fileSearchStores.create({
        config: { displayName: 'your-fileSearchStore-name' }
      });

      // Upload and import a file into the File Search store, supply a file name which will be visible in citations
      let operation = await ai.fileSearchStores.uploadToFileSearchStore({
        file: 'file.txt',
        fileSearchStoreName: fileSearchStore.name,
        config: {
          displayName: 'file-name',
        }
      });

      // Wait until import is complete
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.get({ operation });
      }

      // Ask a question about the file
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Can you tell me about Robert Graves",
        config: {
          tools: [
            {
              fileSearch: {
                fileSearchStoreNames: [fileSearchStore.name]
              }
            }
          ]
        }
      });

      console.log(response.text);
    }

    run();

### REST

    FILE_PATH="path/to/sample.pdf"
    MIME_TYPE=$(file -b --mime-type "${FILE_PATH}")
    NUM_BYTES=$(wc -c < "${FILE_PATH}")

    # Create a FileSearchStore
    STORE_RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${GEMINI_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{ "displayName": "My Store" }')

    # Extract the store name (format: fileSearchStores/xxxxxxx)
    STORE_NAME=$(echo $STORE_RESPONSE | jq -r '.name')

    # Initiate Resumable Upload to the Store
    TMP_HEADER="upload-header.tmp"

    curl -s -D "${TMP_HEADER}" \ "https://generativelanguage.googleapis.com/upload/v1beta/${STORE_NAME}:uploadToFileSearchStore?key=${GEMINI_API_KEY}" \
      -H "X-Goog-Upload-Protocol: resumable" \
      -H "X-Goog-Upload-Command: start" \
      -H "X-Goog-Upload-Header-Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Header-Content-Type: ${MIME_TYPE}" \
      -H "Content-Type: application/json" > /dev/null

    # Extract upload_url from headers
    UPLOAD_URL=$(grep -i "x-goog-upload-url: " "${TMP_HEADER}" | cut -d" " -f2 | tr -d "\r")
    rm "${TMP_HEADER}"

    # --- Upload the actual bytes ---
    curl "${UPLOAD_URL}" \
      -H "Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Offset: 0" \
      -H "X-Goog-Upload-Command: upload, finalize" \
      --data-binary "@${FILE_PATH}" 2> /dev/null

    # Generate content using the FileSearchStore
    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
        -H "x-goog-api-key: $GEMINI_API_KEY" \
        -H 'Content-Type: application/json' \
        -X POST \
        -d '{
                "contents": [{
                    "parts":[{"text": "What does the research say about ..."}]          
                }],
                "tools": [{
                    "file_search": { "file_search_store_names":["'$STORE_NAME'"] }
                }]
            }' 2> /dev/null > response.json

    cat response.json

Check the API reference for[`uploadToFileSearchStore`](https://ai.google.dev/api/file-search/file-search-stores#method:-media.uploadtofilesearchstore)for more information.

## Importing files

Alternatively, you can upload an existing file and import it to your file store:  

### Python

    from google import genai
    from google.genai import types
    import time

    client = genai.Client()

    # Upload the file using the Files API, supply a file name which will be visible in citations
    sample_file = client.files.upload(file='sample.txt', config={'name': 'display_file_name'})

    # Create the File Search store with an optional display name
    file_search_store = client.file_search_stores.create(config={'display_name': 'your-fileSearchStore-name'})

    # Import the file into the File Search store
    operation = client.file_search_stores.import_file(
        file_search_store_name=file_search_store.name,
        file_name=sample_file.name
    )

    # Wait until import is complete
    while not operation.done:
        time.sleep(5)
        operation = client.operations.get(operation)

    # Ask a question about the file
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="""Can you tell me about Robert Graves""",
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[file_search_store.name]
                    )
                )
            ]
        )
    )

    print(response.text)

### JavaScript

    const { GoogleGenAI } = require('@google/genai');

    const ai = new GoogleGenAI({});

    async function run() {
      // Upload the file using the Files API, supply a file name which will be visible in citations
      const sampleFile = await ai.files.upload({
        file: 'sample.txt',
        config: { name: 'file-name' }
      });

      // Create the File Search store with an optional display name
      const fileSearchStore = await ai.fileSearchStores.create({
        config: { displayName: 'your-fileSearchStore-name' }
      });

      // Import the file into the File Search store
      let operation = await ai.fileSearchStores.importFile({
        fileSearchStoreName: fileSearchStore.name,
        fileName: sampleFile.name
      });

      // Wait until import is complete
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.get({ operation: operation });
      }

      // Ask a question about the file
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Can you tell me about Robert Graves",
        config: {
          tools: [
            {
              fileSearch: {
                fileSearchStoreNames: [fileSearchStore.name]
              }
            }
          ]
        }
      });

      console.log(response.text);
    }

    run();

### REST

    FILE_PATH="path/to/sample.pdf"
    MIME_TYPE=$(file -b --mime-type "${FILE_PATH}")
    NUM_BYTES=$(wc -c < "${FILE_PATH}")

    # Create a FileSearchStore
    STORE_RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${GEMINI_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{ "displayName": "My Store" }')

    STORE_NAME=$(echo $STORE_RESPONSE | jq -r '.name')

    # Initiate Resumable Upload to the Store
    TMP_HEADER="upload-header.tmp"

    curl -s -X POST "https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}" \
      -D "${TMP_HEADER}" \
      -H "X-Goog-Upload-Protocol: resumable" \
      -H "X-Goog-Upload-Command: start" \
      -H "X-Goog-Upload-Header-Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Header-Content-Type: ${MIME_TYPE}" \
      -H "Content-Type: application/json" 2> /dev/null

    UPLOAD_URL=$(grep -i "x-goog-upload-url: " "${TMP_HEADER}" | cut -d" " -f2 | tr -d "\r")
    rm "${TMP_HEADER}"

    # Upload the actual bytes.
    curl -s -X POST "${UPLOAD_URL}" \
      -H "Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Offset: 0" \
      -H "X-Goog-Upload-Command: upload, finalize" \
      --data-binary "@${FILE_PATH}" 2> /dev/null > file_info.json

    file_uri=$(jq ".file.name" file_info.json)

    # Import files into the file search store
    operation_name=$(curl "https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}:importFile?key=${GEMINI_API_KEY}" \
      -H "Content-Type: application/json" \
      -X POST \
      -d '{
            "file_name":'$file_uri'
        }' | jq -r .name)

    # Wait for long running operation to complete
    while true; do
      # Get the full JSON status and store it in a variable.
      status_response=$(curl -s -H "x-goog-api-key: $GEMINI_API_KEY" "https://generativelanguage.googleapis.com/v1beta/${operation_name}")

      # Check the "done" field from the JSON stored in the variable.
      is_done=$(echo "${status_response}" | jq .done)

      if [ "${is_done}" = "true" ]; then
        break
      fi
      # Wait for 10 seconds before checking again.
      sleep 10
    done

    # Generate content using the FileSearchStore
    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}" \
        -H 'Content-Type: application/json' \
        -X POST \
        -d '{
                "contents": [{
                    "parts":[{"text": "What does the research say about ..."}]          
                }],
                "tools": [{
                    "file_search": { "file_search_store_names":["'$STORE_NAME'"] }
                }]
            }' 2> /dev/null > response.json

    cat response.json

Check the API reference for[`importFile`](https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.importfile)for more information.

## Chunking configuration

When you import a file into a File Search store, it's automatically broken down into chunks, embedded, indexed, and uploaded to your File Search store. If you need more control over the chunking strategy, you can specify a[`chunking_config`](https://ai.google.dev/api/file-search/file-search-stores#request-body_5)setting to set a maximum number of tokens per chunk and maximum number of overlapping tokens.  

### Python

    # Upload and import and upload the file into the File Search store with a custom chunking configuration
    operation = client.file_search_stores.upload_to_file_search_store(
        file_search_store_name=file_search_store.name,
        file_name=sample_file.name,
        config={
            'chunking_config': {
              'white_space_config': {
                'max_tokens_per_chunk': 200,
                'max_overlap_tokens': 20
              }
            }
        }
    )

### JavaScript

    // Upload and import and upload the file into the File Search store with a custom chunking configuration
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: 'file.txt',
      fileSearchStoreName: fileSearchStore.name,
      config: {
        displayName: 'file-name',
        chunkingConfig: {
          whiteSpaceConfig: {
            maxTokensPerChunk: 200,
            maxOverlapTokens: 20
          }
        }
      }
    });

### REST

    FILE_PATH="path/to/sample.pdf"
    MIME_TYPE=$(file -b --mime-type "${FILE_PATH}")
    NUM_BYTES=$(wc -c < "${FILE_PATH}")

    # Create a FileSearchStore
    STORE_RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${GEMINI_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{ "displayName": "My Store" }')

    # Extract the store name (format: fileSearchStores/xxxxxxx)
    STORE_NAME=$(echo $STORE_RESPONSE | jq -r '.name')

    # Initiate Resumable Upload to the Store
    TMP_HEADER="upload-header.tmp"

    curl -s -D "${TMP_HEADER}" \ "https://generativelanguage.googleapis.com/upload/v1beta/${STORE_NAME}:uploadToFileSearchStore?key=${GEMINI_API_KEY}" \
      -H "X-Goog-Upload-Protocol: resumable" \
      -H "X-Goog-Upload-Command: start" \
      -H "X-Goog-Upload-Header-Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Header-Content-Type: ${MIME_TYPE}" \
      -H "Content-Type: application/json" > /dev/null
      -d '{
            "chunking_config": {
              "white_space_config": {
                "max_tokens_per_chunk": 200,
                "max_overlap_tokens": 20
              }
            }
        }'

    # Extract upload_url from headers
    UPLOAD_URL=$(grep -i "x-goog-upload-url: " "${TMP_HEADER}" | cut -d" " -f2 | tr -d "\r")
    rm "${TMP_HEADER}"

    # --- Upload the actual bytes ---
    curl "${UPLOAD_URL}" \
      -H "Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Offset: 0" \
      -H "X-Goog-Upload-Command: upload, finalize" \
      --data-binary "@${FILE_PATH}" 2> /dev/null

To use your File Search store, pass it as a tool to the`generateContent`method, as shown in the[Upload](https://ai.google.dev/gemini-api/docs/file-search#upload)and[Import](https://ai.google.dev/gemini-api/docs/file-search#importing-files)examples.

## How it works

File Search uses a technique called semantic search to find information relevant to the user prompt. Unlike traditional keyword-based search, semantic search understands the meaning and context of your query.

When you import a file, it's converted into numerical representations called[embeddings](https://ai.google.dev/gemini-api/docs/embeddings), which capture the semantic meaning of the text. These embeddings are stored in a specialized File Search database. When you make a query, it's also converted into an embedding. Then the system performs a File Search to find the most similar and relevant document chunks from the File Search store.

Here's a breakdown of the process for using the File Search`uploadToFileSearchStore`API:

1. **Create a File Search store**: A File Search store contains the processed data from your files. It's the persistent container for the embeddings that the semantic search will operate on.

2. **Upload a file and import into a File Search store** : Simultaneously upload a file and import the results into your File Search store. This creates a temporary`File`object, which is a reference to your raw document. That data is then chunked, converted into File Search embeddings, and indexed. The`File`object gets deleted after 48 hours, while the data imported into the File Search store will be stored indefinitely until you choose to delete it.

3. **Query with File Search** : Finally, you use the`FileSearch`tool in a`generateContent`call. In the tool configuration, you specify a`FileSearchRetrievalResource`, which points to the`FileSearchStore`you want to search. This tells the model to perform a semantic search on that specific File Search store to find relevant information to ground its response.

![The indexing and querying process of File Search](https://ai.google.dev/static/gemini-api/docs/images/File-search.png)The indexing and querying process of File Search

In this diagram, the dotted line from from*Documents* to*Embedding model* (using[`gemini-embedding-001`](https://ai.google.dev/gemini-api/docs/embeddings)) represents the`uploadToFileSearchStore`API (bypassing*File storage* ). Otherwise, using the[Files API](https://ai.google.dev/gemini-api/docs/files)to separately create and then import files moves the indexing process from*Documents* to*File storage* and then to*Embedding model*.

## File Search stores

A File Search store is a container for your document embeddings. While raw files uploaded through the File API are deleted after 48 hours, the data imported into a File Search store is stored indefinitely until you manually delete it. You can create multiple File Search stores to organize your documents. The`FileSearchStore`API lets you create, list, get, and delete to manage your file search stores. File Search store names are globally scoped.

Here are some examples of how to manage your File Search stores:  

### Python

    # Create a File Search store (including optional display_name for easier reference)
    file_search_store = client.file_search_stores.create(config={'display_name': 'my-file_search-store-123'})

    # List all your File Search stores
    for file_search_store in client.file_search_stores.list():
        print(file_search_store)

    # Get a specific File Search store by name
    my_file_search_store = client.file_search_stores.get(name='fileSearchStores/my-file_search-store-123')

    # Delete a File Search store
    client.file_search_stores.delete(name='fileSearchStores/my-file_search-store-123', config={'force': True})

### JavaScript

    // Create a File Search store (including optional display_name for easier reference)
    const fileSearchStore = await ai.fileSearchStores.create({
      config: { displayName: 'my-file_search-store-123' }
    });

    // List all your File Search stores
    const fileSearchStores = await ai.fileSearchStores.list();
    for await (const store of fileSearchStores) {
      console.log(store);
    }

    // Get a specific File Search store by name
    const myFileSearchStore = await ai.fileSearchStores.get({
      name: 'fileSearchStores/my-file_search-store-123'
    });

    // Delete a File Search store
    await ai.fileSearchStores.delete({
      name: 'fileSearchStores/my-file_search-store-123',
      config: { force: true }
    });

### REST

    # Create a File Search store (including optional display_name for easier reference)
    curl -X POST "https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${GEMINI_API_KEY}" \
        -H "Content-Type: application/json" 
        -d '{ "displayName": "My Store" }'

    # List all your File Search stores
    curl "https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${GEMINI_API_KEY}" \

    # Get a specific File Search store by name
    curl "https://generativelanguage.googleapis.com/v1beta/fileSearchStores/my-file_search-store-123?key=${GEMINI_API_KEY}"

    # Delete a File Search store
    curl -X DELETE "https://generativelanguage.googleapis.com/v1beta/fileSearchStores/my-file_search-store-123?key=${GEMINI_API_KEY}"

The[File Search Documents](https://ai.google.dev/api/file-search/documents)API reference for methods and fields related to managing documents in your file stores.

## File metadata

You can add custom metadata to your files to help filter them or provide additional context. Metadata is a set of key-value pairs.  

### Python

    # Import the file into the File Search store with custom metadata
    op = client.file_search_stores.import_file(
        file_search_store_name=file_search_store.name,
        file_name=sample_file.name,
        custom_metadata=[
            {"key": "author", "string_value": "Robert Graves"},
            {"key": "year", "numeric_value": 1934}
        ]
    )

### JavaScript

    // Import the file into the File Search store with custom metadata
    let operation = await ai.fileSearchStores.importFile({
      fileSearchStoreName: fileSearchStore.name,
      fileName: sampleFile.name,
      config: {
        customMetadata: [
          { key: "author", stringValue: "Robert Graves" },
          { key: "year", numericValue: 1934 }
        ]
      }
    });

### REST

    FILE_PATH="path/to/sample.pdf"
    MIME_TYPE=$(file -b --mime-type "${FILE_PATH}")
    NUM_BYTES=$(wc -c < "${FILE_PATH}")

    # Create a FileSearchStore
    STORE_RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${GEMINI_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{ "displayName": "My Store" }')

    # Extract the store name (format: fileSearchStores/xxxxxxx)
    STORE_NAME=$(echo $STORE_RESPONSE | jq -r '.name')

    # Initiate Resumable Upload to the Store
    TMP_HEADER="upload-header.tmp"

    curl -s -D "${TMP_HEADER}" \
      "https://generativelanguage.googleapis.com/upload/v1beta/${STORE_NAME}:uploadToFileSearchStore?key=${GEMINI_API_KEY}" \
      -H "X-Goog-Upload-Protocol: resumable" \
      -H "X-Goog-Upload-Command: start" \
      -H "X-Goog-Upload-Header-Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Header-Content-Type: ${MIME_TYPE}" \
      -H "Content-Type: application/json" \
      -d '{
            "custom_metadata": [
              {"key": "author", "string_value": "Robert Graves"},
              {"key": "year", "numeric_value": 1934}
            ]
        }' > /dev/null

    # Extract upload_url from headers
    UPLOAD_URL=$(grep -i "x-goog-upload-url: " "${TMP_HEADER}" | cut -d" " -f2 | tr -d "\r")
    rm "${TMP_HEADER}"

    # --- Upload the actual bytes ---
    curl "${UPLOAD_URL}" \
      -H "Content-Length: ${NUM_BYTES}" \
      -H "X-Goog-Upload-Offset: 0" \
      -H "X-Goog-Upload-Command: upload, finalize" \
      --data-binary "@${FILE_PATH}" 2> /dev/null

This is useful when you have multiple documents in a File Search store and want to search only a subset of them.  

### Python

    # Use the metadata filter to search within a subset of documents
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Tell me about the book 'I, Claudius'",
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[file_search_store.name],
                        metadata_filter="author=Robert Graves",
                    )
                )
            ]
        )
    )

    print(response.text)

### JavaScript

    // Use the metadata filter to search within a subset of documents
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Tell me about the book 'I, Claudius'",
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [fileSearchStore.name],
              metadataFilter: 'author="Robert Graves"',
            }
          }
        ]
      }
    });

    console.log(response.text);

### REST

    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}" \
        -H 'Content-Type: application/json' \
        -X POST \
        -d '{
                "contents": [{
                    "parts":[{"text": "Tell me about the book I, Claudius"}]          
                }],
                "tools": [{
                    "file_search": { 
                        "file_search_store_names":["'$STORE_NAME'"],
                        "metadata_filter": "author = \"Robert Graves\""
                    }
                }]
            }' 2> /dev/null > response.json

    cat response.json

Guidance on implementing list filter syntax for`metadata_filter`can be found at[google.aip.dev/160](https://google.aip.dev/160)

## Citations

When you use File Search, the model's response may include citations that specify which parts of your uploaded documents were used to generate the answer. This helps with fact-checking and verification.

You can access citation information through the`grounding_metadata`attribute of the response.  

### Python

    print(response.candidates[0].grounding_metadata)

### JavaScript

    console.log(JSON.stringify(response.candidates?.[0]?.groundingMetadata, null, 2));

## Supported models

The following models support File Search:

- [`gemini-3-pro-preview`](https://ai.google.dev/gemini-api/docs/models#gemini-3-pro)
- [`gemini-2.5-pro`](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro)
- [`gemini-2.5-flash`](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash)and its preview versions
- [`gemini-2.5-flash-lite`](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-lite)and its preview versions

## Supported file types

File Search supports a wide range of file formats, listed in the following sections.

### Application file types

- `application/dart`
- `application/ecmascript`
- `application/json`
- `application/ms-java`
- `application/msword`
- `application/pdf`
- `application/sql`
- `application/typescript`
- `application/vnd.curl`
- `application/vnd.dart`
- `application/vnd.ibm.secure-container`
- `application/vnd.jupyter`
- `application/vnd.ms-excel`
- `application/vnd.oasis.opendocument.text`
- `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.template`
- `application/x-csh`
- `application/x-hwp`
- `application/x-hwp-v5`
- `application/x-latex`
- `application/x-php`
- `application/x-powershell`
- `application/x-sh`
- `application/x-shellscript`
- `application/x-tex`
- `application/x-zsh`
- `application/xml`
- `application/zip`

### Text file types

- `text/1d-interleaved-parityfec`
- `text/RED`
- `text/SGML`
- `text/cache-manifest`
- `text/calendar`
- `text/cql`
- `text/cql-extension`
- `text/cql-identifier`
- `text/css`
- `text/csv`
- `text/csv-schema`
- `text/dns`
- `text/encaprtp`
- `text/enriched`
- `text/example`
- `text/fhirpath`
- `text/flexfec`
- `text/fwdred`
- `text/gff3`
- `text/grammar-ref-list`
- `text/hl7v2`
- `text/html`
- `text/javascript`
- `text/jcr-cnd`
- `text/jsx`
- `text/markdown`
- `text/mizar`
- `text/n3`
- `text/parameters`
- `text/parityfec`
- `text/php`
- `text/plain`
- `text/provenance-notation`
- `text/prs.fallenstein.rst`
- `text/prs.lines.tag`
- `text/prs.prop.logic`
- `text/raptorfec`
- `text/rfc822-headers`
- `text/rtf`
- `text/rtp-enc-aescm128`
- `text/rtploopback`
- `text/rtx`
- `text/sgml`
- `text/shaclc`
- `text/shex`
- `text/spdx`
- `text/strings`
- `text/t140`
- `text/tab-separated-values`
- `text/texmacs`
- `text/troff`
- `text/tsv`
- `text/tsx`
- `text/turtle`
- `text/ulpfec`
- `text/uri-list`
- `text/vcard`
- `text/vnd.DMClientScript`
- `text/vnd.IPTC.NITF`
- `text/vnd.IPTC.NewsML`
- `text/vnd.a`
- `text/vnd.abc`
- `text/vnd.ascii-art`
- `text/vnd.curl`
- `text/vnd.debian.copyright`
- `text/vnd.dvb.subtitle`
- `text/vnd.esmertec.theme-descriptor`
- `text/vnd.exchangeable`
- `text/vnd.familysearch.gedcom`
- `text/vnd.ficlab.flt`
- `text/vnd.fly`
- `text/vnd.fmi.flexstor`
- `text/vnd.gml`
- `text/vnd.graphviz`
- `text/vnd.hans`
- `text/vnd.hgl`
- `text/vnd.in3d.3dml`
- `text/vnd.in3d.spot`
- `text/vnd.latex-z`
- `text/vnd.motorola.reflex`
- `text/vnd.ms-mediapackage`
- `text/vnd.net2phone.commcenter.command`
- `text/vnd.radisys.msml-basic-layout`
- `text/vnd.senx.warpscript`
- `text/vnd.sosi`
- `text/vnd.sun.j2me.app-descriptor`
- `text/vnd.trolltech.linguist`
- `text/vnd.wap.si`
- `text/vnd.wap.sl`
- `text/vnd.wap.wml`
- `text/vnd.wap.wmlscript`
- `text/vtt`
- `text/wgsl`
- `text/x-asm`
- `text/x-bibtex`
- `text/x-boo`
- `text/x-c`
- `text/x-c++hdr`
- `text/x-c++src`
- `text/x-cassandra`
- `text/x-chdr`
- `text/x-coffeescript`
- `text/x-component`
- `text/x-csh`
- `text/x-csharp`
- `text/x-csrc`
- `text/x-cuda`
- `text/x-d`
- `text/x-diff`
- `text/x-dsrc`
- `text/x-emacs-lisp`
- `text/x-erlang`
- `text/x-gff3`
- `text/x-go`
- `text/x-haskell`
- `text/x-java`
- `text/x-java-properties`
- `text/x-java-source`
- `text/x-kotlin`
- `text/x-lilypond`
- `text/x-lisp`
- `text/x-literate-haskell`
- `text/x-lua`
- `text/x-moc`
- `text/x-objcsrc`
- `text/x-pascal`
- `text/x-pcs-gcd`
- `text/x-perl`
- `text/x-perl-script`
- `text/x-python`
- `text/x-python-script`
- `text/x-r-markdown`
- `text/x-rsrc`
- `text/x-rst`
- `text/x-ruby-script`
- `text/x-rust`
- `text/x-sass`
- `text/x-scala`
- `text/x-scheme`
- `text/x-script.python`
- `text/x-scss`
- `text/x-setext`
- `text/x-sfv`
- `text/x-sh`
- `text/x-siesta`
- `text/x-sos`
- `text/x-sql`
- `text/x-swift`
- `text/x-tcl`
- `text/x-tex`
- `text/x-vbasic`
- `text/x-vcalendar`
- `text/xml`
- `text/xml-dtd`
- `text/xml-external-parsed-entity`
- `text/yaml`

## Rate limits

The File Search API has the following limits to enforce service stability:

- **Maximum file size / per document limit**: 100 MB
- **Total size of project File Search stores** (based on user tier):
  - **Free**: 1 GB
  - **Tier 1**: 10 GB
  - **Tier 2**: 100 GB
  - **Tier 3**: 1 TB
- **Recommendation**: Limit the size of each File Search store to under 20 GB to ensure optimal retrieval latencies.

| **Note:** The limit on File Search store size is computed on the backend, based on the size of your input plus the embeddings generated and stored with it. This is typically approximately 3 times the size of your input data.

## Pricing

- Developers are charged for embeddings at indexing time based on existing[embeddings pricing](https://ai.google.dev/gemini-api/docs/pricing#gemini-embedding)($0.15 per 1M tokens).
- Storage is free of charge.
- Query time embeddings are free of charge.
- Retrieved document tokens are charged as regular[context tokens](https://ai.google.dev/gemini-api/docs/tokens).

## What's next

- Visit the API reference for[File Search Stores](https://ai.google.dev/api/file-search/file-search-stores)and File Search[Documents](https://ai.google.dev/api/file-search/documents).


<br />

Use this guide to help you diagnose and resolve common issues that arise when you call the Gemini API. You may encounter issues from either the Gemini API backend service or the client SDKs. Our client SDKs are open sourced in the following repositories:

- [python-genai](https://github.com/googleapis/python-genai)
- [js-genai](https://github.com/googleapis/js-genai)
- [go-genai](https://github.com/googleapis/go-genai)

If you encounter API key issues, verify that you have set up your API key correctly per the[API key setup guide](https://ai.google.dev/gemini-api/docs/api-key).

## Gemini API backend service error codes

The following table lists common backend error codes you may encounter, along with explanations for their causes and troubleshooting steps:

|---------------|---------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **HTTP Code** | **Status**          | **Description**                                                                                                   | **Example**                                                                                                                                                                                            | **Solution**                                                                                                                                                                                                                                                                            |
| 400           | INVALID_ARGUMENT    | The request body is malformed.                                                                                    | There is a typo, or a missing required field in your request.                                                                                                                                          | Check the[API reference](https://ai.google.dev/api)for request format, examples, and supported versions. Using features from a newer API version with an older endpoint can cause errors.                                                                                               |
| 400           | FAILED_PRECONDITION | Gemini API free tier is not available in your country. Please enable billing on your project in Google AI Studio. | You are making a request in a region where the free tier is not supported, and you have not enabled billing on your project in Google AI Studio.                                                       | To use the Gemini API, you will need to setup a paid plan using[Google AI Studio](https://aistudio.google.com/app/apikey).                                                                                                                                                              |
| 403           | PERMISSION_DENIED   | Your API key doesn't have the required permissions.                                                               | You are using the wrong API key; you are trying to use a tuned model without going through[proper authentication](https://ai.google.dev/docs/model-tuning/tutorial?lang=python#set_up_authentication). | Check that your API key is set and has the right access. And make sure to go through proper authentication to use tuned models.                                                                                                                                                         |
| 404           | NOT_FOUND           | The requested resource wasn't found.                                                                              | An image, audio, or video file referenced in your request was not found.                                                                                                                               | Check if all[parameters in your request are valid](https://ai.google.dev/docs/troubleshooting#check-api)for your API version.                                                                                                                                                           |
| 429           | RESOURCE_EXHAUSTED  | You've exceeded the rate limit.                                                                                   | You are sending too many requests per minute with the free tier Gemini API.                                                                                                                            | Verify that you're within the model's[rate limit](https://ai.google.dev/gemini-api/docs/rate-limits).[Request a quota increase](https://ai.google.dev/gemini-api/docs/rate-limits#request-rate-limit-increase)if needed.                                                                |
| 500           | INTERNAL            | An unexpected error occurred on Google's side.                                                                    | Your input context is too long.                                                                                                                                                                        | Reduce your input context or temporarily switch to another model (e.g. from Gemini 1.5 Pro to Gemini 1.5 Flash) and see if it works. Or wait a bit and retry your request. If the issue persists after retrying, please report it using the**Send feedback**button in Google AI Studio. |
| 503           | UNAVAILABLE         | The service may be temporarily overloaded or down.                                                                | The service is temporarily running out of capacity.                                                                                                                                                    | Temporarily switch to another model (e.g. from Gemini 1.5 Pro to Gemini 1.5 Flash) and see if it works. Or wait a bit and retry your request. If the issue persists after retrying, please report it using the**Send feedback**button in Google AI Studio.                              |
| 504           | DEADLINE_EXCEEDED   | The service is unable to finish processing within the deadline.                                                   | Your prompt (or context) is too large to be processed in time.                                                                                                                                         | Set a larger 'timeout' in your client request to avoid this error.                                                                                                                                                                                                                      |

## Check your API calls for model parameter errors

Verify that your model parameters are within the following values:

|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Model parameter** | **Values (range)**                                                                                                                                              |
| Candidate count     | 1-8 (integer)                                                                                                                                                   |
| Temperature         | 0.0-1.0                                                                                                                                                         |
| Max output tokens   | Use`get_model`([Python](https://ai.google.dev/api/python/google/generativeai/get_model)) to determine the maximum number of tokens for the model you are using. |
| TopP                | 0.0-1.0                                                                                                                                                         |

In addition to checking parameter values, make sure you're using the correct[API version](https://ai.google.dev/gemini-api/docs/api-versions)(e.g.,`/v1`or`/v1beta`) and model that supports the features you need. For example, if a feature is in Beta release, it will only be available in the`/v1beta`API version.

## Check if you have the right model

Verify that you are using a supported model listed on our[models page](https://ai.google.dev/gemini-api/docs/models/gemini).

## Higher latency or token usage with 2.5 models

If you're observing higher latency or token usage with the 2.5 Flash and Pro models, this can be because they come with**thinking is enabled by default**in order to enhance quality. If you are prioritizing speed or need to minimize costs, you can adjust or disable thinking.

Refer to[thinking page](https://ai.google.dev/gemini-api/docs/thinking#set-budget)for guidance and sample code.

## Safety issues

If you see a prompt was blocked because of a safety setting in your API call, review the prompt with respect to the filters you set in the API call.

If you see`BlockedReason.OTHER`, the query or response may violate the[terms of service](https://ai.google.dev/terms)or be otherwise unsupported.

## Recitation issue

If you see the model stops generating output due to the RECITATION reason, this means the model output may resemble certain data. To fix this, try to make prompt / context as unique as possible and use a higher temperature.
| When using Gemini 3 models, we strongly recommend keeping the`temperature`at its default value of 1.0. Changing the temperature (setting it below 1.0) may lead to unexpected behavior, such as looping or degraded performance, particularly in complex mathematical or reasoning tasks.

## Repetitive tokens issue

If you see repeated output tokens, try the following suggestions to help reduce or eliminate them.

|                     Description                      |                                                                                               Cause                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   Suggested workaround                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|         Repeated hyphens in Markdown tables          | This can occur when the contents of the table are long as the model tries to create a visually aligned Markdown table. However, the alignment in Markdown is not necessary for correct rendering. | Add instructions in your prompt to give the model specific guidelines for generating Markdown tables. Provide examples that follow those guidelines. You can also try adjusting the temperature. For generating code or very structured output like Markdown tables, high temperature have shown to work better (\>= 0.8). The following is an example set of guidelines you can add to your prompt to prevent this issue: ``` # Markdown Table Format * Separator line: Markdown tables must include a separator line below the header row. The separator line must use only 3 hyphens per column, for example: |---|---|---|. Using more hypens like ----, -----, ------ can result in errors. Always use |:---|, |---:|, or |---| in these separator strings. For example: | Date | Description | Attendees | |---|---|---| | 2024-10-26 | Annual Conference | 500 | | 2025-01-15 | Q1 Planning Session | 25 | * Alignment: Do not align columns. Always use |---|. For three columns, use |---|---|---| as the separator line. For four columns use |---|---|---|---| and so on. * Conciseness: Keep cell content brief and to the point. * Never pad column headers or other cells with lots of spaces to match with width of other content. Only a single space on each side is needed. For example, always do "| column name |" instead of "| column name                |". Extra spaces are wasteful. A markdown renderer will automatically take care displaying the content in a visually appealing form. ``` |
|          Repeated tokens in Markdown tables          |          Similar to the repeated hyphens, this occurs when the model tries to visually align the contents of the table. The alignment in Markdown is not required for correct rendering.          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   - Try adding instructions like the following to your system prompt: ``` FOR TABLE HEADINGS, IMMEDIATELY ADD ' |' AFTER THE TABLE HEADING. ``` - Try adjusting the temperature. Higher temperatures (\>= 0.8) generally helps to eliminate repetitions or duplication in the output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|    Repeated newlines (`\n`) in structured output     |                                            When the model input contains unicode or escape sequences like`\u`or`\t`, it can lead to repeated newlines.                                            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            - Check for and replace forbidden escape sequences with UTF-8 characters in your prompt. For example,`\u`escape sequence in your JSON examples can cause the model to use them in its output too. - Instruct the model on allowed escapes. Add a system instruction like this: ``` In quoted strings, the only allowed escape sequences are \\, \n, and \". Instead of \u escapes, use UTF-8. ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|       Repeated text in using structured output       |                                  When the model output has a different order for the fields than the defined structured schema, this can lead to repeating text.                                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  - Don't specify the order of fields in your prompt. - Make all output fields required.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|               Repetitive tool calling                |                                    This can occur if the model loses the context of previous thoughts and/or call an unavailable endpoint that it's forced to.                                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Instruct the model to maintain state within its thought process. Add this to the end of your system instructions: ``` When thinking silently: ALWAYS start the thought with a brief (one sentence) recap of the current progress on the task. In particular, consider whether the task is already done. ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Repetitive text that's not part of structured output |                                                            This can occur if the model gets stuck on a request that it can't resolve.                                                             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     - If thinking is turned on, avoid giving explicit orders for how to think through a problem in the instructions. Just ask for the final output. - Try a higher temperature \>= 0.8. - Add instructions like "Be concise", "Don't repeat yourself", or "Provide the answer once".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

## Improve model output

For higher quality model outputs, explore writing more structured prompts. The[prompt engineering guide](https://ai.google.dev/gemini-api/docs/prompting-strategies)page introduces some basic concepts, strategies, and best practices to get you started.

## Understand token limits

Read through our[Token guide](https://ai.google.dev/gemini-api/docs/tokens)to better understand how to count tokens and their limits.

## Known issues

- The API supports only a number of select languages. Submitting prompts in unsupported languages can produce unexpected or even blocked responses. See[available languages](https://ai.google.dev/gemini-api/docs/models#supported-languages)for updates.

## File a bug

Join the discussion on the[Google AI developer forum](https://discuss.ai.google.dev)if you have questions.

