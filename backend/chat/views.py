import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
from products.models import Product, ProductStatus
from .models import ChatMessage
from .serializers import ChatMessageSerializer
import openai 

class ChatView(APIView):
    permission_classes = [AllowAny]  # IsAuthenticated if you want login required

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        
        if not user_message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get approved products from database
        products = Product.objects.filter(status=ProductStatus.APPROVED)
        
        # Build context for AI
        product_data = "\n".join([
            f"- {p.name}: {p.description} | Price: ${p.price} | Business: {p.business_name}"
            for p in products[:20]  # Limit to avoid token overflow
        ])

        # Call AI API
        try:
            ai_response = self._get_ai_response(user_message, product_data)
        except Exception as e:
            return Response(
                {'error': f'AI service error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save to database
        chat_message = ChatMessage.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=request.session.session_key or 'anonymous',
            user_message=user_message,
            ai_response=ai_response,
        )

        return Response({
            'id': chat_message.id,
            'user_message': user_message,
            'ai_response': ai_response,
            'created_at': chat_message.created_at,
        })

    def _get_ai_response(self, user_message: str, product_data: str) -> str:
        """Call OpenAI API"""
        
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured in settings")
        
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cheap and fast
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a helpful product assistant for an e-commerce marketplace. Answer questions about these approved products:

{product_data}

Instructions:
- Be concise and friendly
- If asked about products not in the list, politely say they're not currently available
- When recommending products, mention the price and business name
- If asked about price ranges, filter and list matching products
- Keep responses under 200 words"""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=400,
            temperature=0.7,
        )
        return response.choices[0].message.content


class ChatHistoryView(APIView):
    """Get chat history for current user or session"""
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            messages = ChatMessage.objects.filter(user=request.user)[:20]
        else:
            session_id = request.session.session_key
            if not session_id:
                return Response([])
            messages = ChatMessage.objects.filter(session_id=session_id)[:20]

        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)