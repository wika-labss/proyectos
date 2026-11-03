package lat.vissiuss.pedidosfotos.ui.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import lat.vissiuss.pedidosfotos.data.Aggregator
import lat.vissiuss.pedidosfotos.ui.UploadFormState
import lat.vissiuss.pedidosfotos.ui.UploadUiState

@Composable
fun UploadFormScreen(
    form: UploadFormState,
    uploadState: UploadUiState,
    onAggregatorChange: (Aggregator) -> Unit,
    onOrderNumberChange: (String) -> Unit,
    onUseToday: () -> Unit,
    onCustomDateChange: (String) -> Unit,
    onUpload: () -> Unit,
    onDiscard: () -> Unit,
) {
    val isUploading = uploadState is UploadUiState.Uploading
    val scroll = rememberScrollState()

    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .verticalScroll(scroll)
                .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Completa el formulario antes de guardar en Drive")

        Text("Agregador")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Aggregator.entries.forEach { aggregator ->
                FilterChip(
                    selected = form.aggregator == aggregator,
                    onClick = { onAggregatorChange(aggregator) },
                    label = { Text(aggregator.displayName) },
                )
            }
        }

        OutlinedTextField(
            value = form.orderNumber,
            onValueChange = onOrderNumberChange,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Número de pedido") },
            singleLine = true,
        )

        Text("Fecha (opcional)")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = form.useToday,
                onClick = onUseToday,
                label = { Text("Hoy") },
            )
        }
        OutlinedTextField(
            value = if (form.useToday) "" else form.customDate,
            onValueChange = onCustomDateChange,
            enabled = !form.useToday,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Fecha (AAAA-MM-DD)") },
            placeholder = { Text("2026-11-03") },
            singleLine = true,
        )

        Text(
            "La imagen se renombrará a ${form.orderNumber.ifBlank { "{pedido}" }}.jpg " +
                "y se subirá a la carpeta ${form.aggregator.displayName} en Google Drive.",
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = onUpload,
            enabled = form.orderNumber.isNotBlank() && !isUploading,
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (isUploading) {
                CircularProgressIndicator()
            } else {
                Text("Subir a Drive")
            }
        }

        OutlinedButton(
            onClick = onDiscard,
            enabled = !isUploading,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Descartar foto")
        }

        if (uploadState is UploadUiState.Success) {
            Text(uploadState.message)
        }
        if (uploadState is UploadUiState.Error) {
            Text(uploadState.message)
        }
    }
}
