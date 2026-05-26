package com.aplicacionmovil

import android.graphics.Color
import android.graphics.Typeface
import android.view.Gravity
import android.widget.TextView
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import kotlin.math.abs

class AvatarViewManager : SimpleViewManager<TextView>() {
    override fun getName() = "AvatarView"

    override fun createViewInstance(reactContext: ThemedReactContext): TextView {
        val textView = TextView(reactContext)
        textView.gravity = Gravity.CENTER
        textView.setTextColor(Color.WHITE)
        textView.textSize = 16f
        textView.typeface = Typeface.DEFAULT_BOLD
        textView.includeFontPadding = false
        return textView
    }

    @ReactProp(name = "name")
    fun setName(view: TextView, name: String?) {
        if (name.isNullOrBlank()) {
            view.text = ""
            view.setBackgroundColor(Color.GRAY)
            return
        }

        // 1. Extraer iniciales
        val parts = name.trim().split("\\s+".toRegex())
        val initials = when (parts.size) {
            1 -> parts[0].take(1).uppercase()
            else -> "${parts[0].take(1)}${parts[parts.size - 1].take(1)}".uppercase()
        }
        view.text = initials

        // 2. Generar color de fondo único con hash del nombre
        val colors = listOf(
            "#F44336", "#E91E63", "#9C27B0", "#673AB7", 
            "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", 
            "#009688", "#4CAF50", "#8BC34A", "#CDDC39", 
            "#FFC107", "#FF9800", "#FF5722", "#795548"
        )
        val hash = abs(name.hashCode())
        val colorHex = colors[hash % colors.size]
        
        // 3. Renderizar circular: La vista se hará circular en JS con borderRadius
        view.setBackgroundColor(Color.parseColor(colorHex))
    }
}