package lat.vissiuss.pedidosfotos.drive

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import lat.vissiuss.pedidosfotos.data.Aggregator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.util.UUID

class DriveRepository(
    private val httpClient: OkHttpClient = OkHttpClient(),
) {
    suspend fun verifyFolderWriteAccess(
        accessToken: String,
        aggregator: Aggregator,
    ): Result<Unit> =
        withContext(Dispatchers.IO) {
            runCatching {
                val request =
                    Request.Builder()
                        .url(
                            "https://www.googleapis.com/drive/v3/files/${aggregator.driveFolderId}" +
                                "?fields=id,name,capabilities",
                        )
                        .header("Authorization", "Bearer $accessToken")
                        .get()
                        .build()

                httpClient.newCall(request).execute().use { response ->
                    val body = response.body?.string().orEmpty()
                    if (!response.isSuccessful) {
                        error(
                            "No se pudo acceder a ${aggregator.displayName} (${response.code}): $body",
                        )
                    }
                    val json = JSONObject(body)
                    val canAdd = json.optJSONObject("capabilities")?.optBoolean("canAddChildren") == true
                    if (!canAdd) {
                        error(
                            "La cuenta no puede subir a ${aggregator.displayName} " +
                                "(${json.optString("name")}). Pide acceso Editor en Drive.",
                        )
                    }
                }
            }
        }

    suspend fun verifyAllFolders(accessToken: String): Result<Unit> =
        withContext(Dispatchers.IO) {
            val errors = mutableListOf<String>()
            for (aggregator in Aggregator.entries) {
                verifyFolderWriteAccess(accessToken, aggregator).exceptionOrNull()?.let { error ->
                    errors += error.message ?: aggregator.displayName
                }
            }
            if (errors.isEmpty()) {
                Result.success(Unit)
            } else {
                Result.failure(IllegalStateException(errors.joinToString("\n")))
            }
        }

    suspend fun uploadPhoto(
        accessToken: String,
        aggregator: Aggregator,
        orderNumber: String,
        localFile: File,
        dateLabel: String,
    ): Result<String> =
        withContext(Dispatchers.IO) {
            runCatching {
                val safeName = sanitizeOrderNumber(orderNumber)
                val metadata =
                    JSONObject()
                        .put("name", "$safeName.jpg")
                        .put("parents", org.json.JSONArray(listOf(aggregator.driveFolderId)))
                        .put(
                            "description",
                            "Agregador=${aggregator.displayName}; Fecha=$dateLabel",
                        )

                val boundary = "pedidos-fotos-${UUID.randomUUID()}"
                val multipartBody =
                    buildMultipartBody(
                        boundary = boundary,
                        metadataJson = metadata.toString(),
                        imageFile = localFile,
                    )

                val request =
                    Request.Builder()
                        .url("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink")
                        .header("Authorization", "Bearer $accessToken")
                        .header("Content-Type", "multipart/related; boundary=$boundary")
                        .post(multipartBody)
                        .build()

                httpClient.newCall(request).execute().use { response ->
                    val body = response.body?.string().orEmpty()
                    if (!response.isSuccessful) {
                        error("Error al subir (${response.code}): $body")
                    }
                    val json = JSONObject(body)
                    json.optString("webViewLink").ifBlank { json.optString("id") }
                }
            }
        }

    private fun buildMultipartBody(
        boundary: String,
        metadataJson: String,
        imageFile: File,
    ): okhttp3.RequestBody {
        val mediaType = "multipart/related; boundary=$boundary".toMediaType()
        val delimiter = "--$boundary\r\n"
        val closing = "--$boundary--\r\n"

        val jsonPart =
            delimiter +
                "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
                metadataJson +
                "\r\n"

        val fileHeader =
            delimiter +
                "Content-Type: image/jpeg\r\n\r\n"

        val jsonBytes = jsonPart.toByteArray(Charsets.UTF_8)
        val fileHeaderBytes = fileHeader.toByteArray(Charsets.UTF_8)
        val closingBytes = closing.toByteArray(Charsets.UTF_8)
        val imageBytes = imageFile.readBytes()

        val combined =
            jsonBytes + fileHeaderBytes + imageBytes + "\r\n".toByteArray() + closingBytes

        return combined.toRequestBody(mediaType)
    }

    private fun sanitizeOrderNumber(raw: String): String {
        val trimmed = raw.trim()
        require(trimmed.isNotEmpty()) { "El número de pedido es obligatorio." }
        val safe =
            trimmed.replace(Regex("[\\\\/:*?\"<>|]"), "_")
                .replace(Regex("\\s+"), "_")
        require(safe.isNotEmpty()) { "Número de pedido inválido." }
        return safe
    }
}
