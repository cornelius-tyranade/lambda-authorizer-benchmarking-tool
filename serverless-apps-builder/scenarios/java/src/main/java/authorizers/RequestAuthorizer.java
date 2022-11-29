package authorizers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

public class RequestAuthorizer implements RequestHandler<APIGatewayProxyRequestEvent, Response> {

    public Response handleRequest(APIGatewayProxyRequestEvent event, Context context) {
        Map<String, String> queryStringParameters = event.getQueryStringParameters();
        String queryStringValue = queryStringParameters.get("QueryString1");
        String auth = "Deny";

        if ("queryValue1".equals(queryStringValue)) {
            auth = "Allow";
        }
        Map<String, String> ctx = new HashMap<String, String>();
        ctx.put("sub", "test");
        APIGatewayProxyRequestEvent.ProxyRequestContext proxyContext = event.getRequestContext();
        APIGatewayProxyRequestEvent.RequestIdentity identity = proxyContext.getIdentity();

        String arn = String.format("arn:aws:execute-api:%s:%s:%s/%s/%s/%s",System.getenv("AWS_REGION"), proxyContext.getAccountId(),
                proxyContext.getApiId(), proxyContext.getStage(), proxyContext.getHttpMethod(), "*");
        Statement statement = Statement.builder().effect(auth).resource(arn).build();
        PolicyDocument policyDocument = PolicyDocument.builder().statements(Collections.singletonList(statement))
                .build();

        return Response.builder().principalId("user:test").policyDocument(policyDocument)
                .context(ctx).build();
    }
}

@JsonDeserialize(builder = Response.Builder.class)
class Response {
    @JsonProperty("principalId")
    private String principalId;
    @JsonProperty("policyDocument")
    private PolicyDocument policyDocument;
    @JsonProperty("context")
    private Map<String, String> context;

    private Response(Builder builder) {
        this.principalId = builder.principalId;
        this.policyDocument = builder.policyDocument;
        this.context = builder.context;
    }

    public String getPrincipalId() {
        return principalId;
    }

    public PolicyDocument getPolicyDocument() {
        return policyDocument;
    }

    public Map<String, String> getContext() {
        return context;
    }

    public static Builder builder() {
        return new Builder();
    }

    @JsonPOJOBuilder(withPrefix = "")
    public static final class Builder {
        private String principalId;
        private PolicyDocument policyDocument;
        private Map<String, String> context;
        private Builder() { }

        public Builder principalId(String principalId) {
            this.principalId = principalId;
            return this;
        }

        public Builder policyDocument(PolicyDocument policyDocument) {
            this.policyDocument = policyDocument;
            return this;
        }

        public Builder context(Map<String, String> context) {
            this.context = context;
            return this;
        }

        public Response build() {
            return new Response(this);
        }
    }
}

@JsonDeserialize(builder = PolicyDocument.Builder.class)
class PolicyDocument {
    public final String Version = "2012-10-17";
    public List<Statement> Statement;

    private PolicyDocument(Builder builder) {
        this.Statement = builder.statements;
    }

    public static Builder builder(){
        return new Builder();
    }
    @JsonPOJOBuilder(withPrefix = "")
    public static final class Builder {
        private List<Statement> statements;

        private Builder() {
            statements = new ArrayList<Statement>();
        }

        public Builder statements(List<Statement> statements) {
            this.statements = statements;
            return this;
        }

        public PolicyDocument build() {
           return new PolicyDocument(this);
        }
    }
}

@JsonDeserialize(builder = Statement.Builder.class)
class Statement {
    public final String Action = "execute-api:Invoke";
    public String Effect;
    public String Resource;

    private Statement(Builder builder) {
        this.Effect = builder.effect;
        this.Resource = builder.resource;
    }

    public static Builder builder() {
        return new Builder();
    }

    @JsonPOJOBuilder(withPrefix = "")
    public static final class Builder {
        private String effect;
        private String resource;
        private Builder() { }

        public Builder effect(String effect) {
            this.effect = effect;
            return this;
        }

        public Builder resource(String resource) {
            this.resource = resource;
            return this;
        }

        public Statement build() {
            return new Statement(this);
        }
    }
}