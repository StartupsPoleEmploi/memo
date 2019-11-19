package fr.gouv.motivaction.exception;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
 
@Provider
public class ApiParameterException extends Throwable implements ExceptionMapper<Throwable>
{
    private static final long serialVersionUID = 1L;
  
    @Override
    public Response toResponse(Throwable exception)
    {
        return Response.status(500).entity("Wrong parameters").type("text/plain").build();
    }
}