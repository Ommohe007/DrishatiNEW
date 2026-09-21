# Drishti Mobile — Android App
## Project Drishti | SIH 2026 PS-26060

### Tech Stack
- **Language**: Kotlin with Jetpack Compose
- **3D Rendering**: SceneView / Filament
- **Real-time**: Kotlin Coroutines + OkHttp WebSocket

### Architecture
`
[Backend WS :8000] <──► [OkHttp WebSocket Client]
                                │
                    [TelemetryViewModel (StateFlow)]
                                │
                ┌───────────────┼───────────────┐
       [3D SceneView]  [Dashboard Composables]  [AlertsScreen]
`

### Screens
1. **GodsEyeScreen** — SceneView 3D model of Maitri/Bharati with interactive zones
2. **DashboardScreen** — Subsystem status cards, Recharts-equivalent Compose charts
3. **CCTVScreen** — CCTV annotated frame stream displayed via AsyncImage
4. **AlertsScreen** — Push notifications for CRITICAL subsystem events
5. **RiskScreen** — AI risk gauges (Blizzard, Fuel, WaterFreeze)

### Dependencies (build.gradle.kts)
`kotlin
implementation("io.github.sceneview:sceneview:2.2.1")
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
implementation("androidx.compose.ui:ui:1.7.5")
implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
implementation("io.coil-kt:coil-compose:2.7.0")
`

### WebSocket Connection
`kotlin
class DrishtiWebSocketClient(
    private val url: String = \"ws://YOUR_BACKEND_IP:8000/ws\",
    private val scope: CoroutineScope
) {
    private val client = OkHttpClient()
    private val _telemetry = MutableStateFlow<TelemetryPayload?>(null)
    val telemetry: StateFlow<TelemetryPayload?> = _telemetry.asStateFlow()

    fun connect() {
        val request = Request.Builder().url(url).build()
        client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                scope.launch {
                    val payload = Json.decodeFromString<TelemetryPayload>(text)
                    _telemetry.emit(payload)
                }
            }
        })
    }
}
`

### Setup
1. Open mobile/ in Android Studio Hedgehog or newer.
2. Set BACKEND_IP in local.properties: ackend.ip=192.168.x.x
3. Build & run on Android 8.0+ (API 26+) device or emulator.

> **Note**: SceneView requires OpenGL ES 3.1+ and Vulkan support. Use a physical device for best results.
