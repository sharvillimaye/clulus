from elevenlabs import stream
from elevenlabs.client import ElevenLabs

elevenlabs = ElevenLabs(
  api_key='',
)

audio_stream = elevenlabs.text_to_speech.stream(
    text="Hi there! Thanks for checking out this text-to-speech demo. This voice is designed to sound clear, natural, and expressive, making it easy to understand in any situation. Whether you're listening on the go or using it in an app, we hope it feels smooth and lifelike. Let's see what it can do",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2"
)

stream(audio_stream)