package ru.nikitka.api;

import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ru.nikitka.api.dto.AuthResponse;
import ru.nikitka.api.dto.LoginRequest;
import ru.nikitka.ejb.UserService;
import ru.nikitka.model.entity.UserEntity;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    private static final String USER_ID_ATTR = "userId";

    @Inject
    private UserService userService;

    @POST
    @Path("/login")
    public Response login(LoginRequest req, @Context HttpServletRequest request) {
        if (req == null || isBlank(req.getUsername()) || isBlank(req.getPassword())) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Требуется имя пользователя и пароль.").build();
        }

        return userService.findByUsername(req.getUsername())
                .filter(user -> userService.checkPassword(user, req.getPassword()))
                .map(user -> {
                    HttpSession session = request.getSession(true);
                    session.setAttribute(USER_ID_ATTR, user.getId());
                    return Response.ok(new AuthResponse(user.getUsername())).build();
                })
                .orElse(Response.status(Response.Status.UNAUTHORIZED).entity("Неверные учетные данные").build());
    }

    @POST
    @Path("/register")
    public Response register(LoginRequest req, @Context HttpServletRequest request) {
        if (req == null || isBlank(req.getUsername()) || isBlank(req.getPassword())) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Требуется имя пользователя и пароль.").build();
        }
        if (!isValidLogin(req.getUsername()) || !isValidPassword(req.getPassword())) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Validation failed").build();
        }
        if (userService.findByUsername(req.getUsername()).isPresent()) {
            return Response.status(Response.Status.CONFLICT).entity("Пользователь существует").build();
        }
        try {
            var user = userService.createUser(req.getUsername(), req.getPassword());
            HttpSession session = request.getSession(true);
            session.setAttribute(USER_ID_ATTR, user.getId());
            return Response.ok(new AuthResponse(user.getUsername())).build();
        } catch (IllegalArgumentException ex) {
            return Response.status(Response.Status.CONFLICT).entity("Пользователь существует").build();
        }
    }

    @POST
    @Path("/logout")
    public Response logout(@Context HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return Response.noContent().build();
    }

    @GET
    @Path("/me")
    public Response me(@Context HttpServletRequest request) {
        Long userId = getUserId(request);
        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        return userService.findById(userId)
                .map(u -> Response.ok(new AuthResponse(u.getUsername())).build())
                .orElse(Response.status(Response.Status.UNAUTHORIZED).build());
    }

    static Long getUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object val = session.getAttribute(USER_ID_ATTR);
        return (val instanceof Long) ? (Long) val : null;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private boolean isValidLogin(String s) {
        String v = s.trim();
        return v.length() >= 3 && v.length() <= 64;
    }

    private boolean isValidPassword(String s) {
        return s.length() >= 6 && s.length() <= 128;
    }
}

