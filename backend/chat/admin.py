from django.contrib import admin
from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_user_identifier', 'user_message_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user_message', 'ai_response', 'user__email', 'session_id']
    readonly_fields = ['user', 'session_id', 'user_message', 'ai_response', 'created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'session_id', 'created_at')
        }),
        ('Conversation', {
            'fields': ('user_message', 'ai_response')
        }),
    )

    def get_user_identifier(self, obj):
        if obj.user:
            return obj.user.email
        return f"Anonymous ({obj.session_id[:8]}...)"
    get_user_identifier.short_description = 'User'

    def user_message_preview(self, obj):
        return obj.user_message[:100] + '...' if len(obj.user_message) > 100 else obj.user_message
    user_message_preview.short_description = 'Message'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
